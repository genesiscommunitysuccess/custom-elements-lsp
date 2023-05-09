import { HTMLElement } from "node-html-parser";
import { TemplateContext } from "typescript-template-language-service-decorator";
import { Diagnostic, DiagnosticCategory } from "typescript/lib/tsserverlibrary";
import { CustomElementsResource } from "../transformer/custom-elements-resource";
import { LanguageServiceLogger } from "../utils";

export class DiagnosticsService {
  constructor(
    private logger: LanguageServiceLogger,
    private ceResource: CustomElementsResource
  ) {
    logger.log("Setting up Diagnostics");
  }

  /**
   * Get any diagnostic items for custom elements in the tagged template which don't exist
   * in the cache. Return as warnings due to the fact that the custom element may be defined,
   * but not in the cache
   * @param context - TemplateContext from the template language service
   * @param elementList - List of HTMLElements from the template, `HTMLElement` is `from node-html-parseR` **not** the standard DOM API.
   * @returns - Array of Diagnostics
   */
  getUnknownCETag(
    context: TemplateContext,
    elementList: HTMLElement[]
  ): Diagnostic[] {
    const sourceFile = context.node.getSourceFile();

    const customElementTags = elementList.filter((elem) =>
      elem.tagName.includes("-")
    );
    this.logger.log(
      `getUnkownCETag: customElementTags: ${customElementTags.length}`
    );

    const ceNames = this.ceResource.getCENames();
    const invalidCETags = customElementTags
      .filter((elem) => !ceNames.includes(elem.tagName.toLowerCase()))
      .map((elem) => elem.tagName.toLowerCase());

    this.logger.log(`getUnkownCETag: invalidCETags: ${invalidCETags}`);

    return context.rawText
      .split(/\n/g)
      .map((line, i) => invalidCETags.map((tag) => ({ line, tag, i })))
      .flat()
      .filter(({ line, tag }) => line.includes(tag))
      .map(({ line, tag, i }) => ({
        category: DiagnosticCategory.Warning,
        code: 0,
        file: sourceFile,
        start: context.toOffset({
          line: i,
          character: line.indexOf(tag),
        }),
        length: tag.length,
        messageText: `Unknown custom element: ${tag}`,
      }));
  }

  /**
   * Get any diagnotic items for attributes on known custom elements, which are invalid attributes
   * @param context - TemplateContext from the template language service
   * @param elementList - List of HTMLElements from the template, `HTMLElement` is `from node-html-parseR` **not** the standard DOM API.
   * @returns - Array of Diagnostics
   */
  getInvalidCEAttribute(
    context: TemplateContext,
    elementList: HTMLElement[]
  ): Diagnostic[] {
    const sourceFile = context.node.getSourceFile();
    const ceNames = this.ceResource.getCENames();

    const tagsAndAttrs = elementList
      .filter(
        (elem) =>
          elem.tagName.includes("-") &&
          ceNames.includes(elem.tagName.toLowerCase())
      )
      .map((elem) => ({
        tagName: elem.tagName.toLowerCase(),
        attrs: Object.keys(elem.attributes),
      }));

    const occurances: Map<string, number> = new Map();

    const withOccurances = tagsAndAttrs.map((tagAndAttrs) => {
      const o = occurances.get(tagAndAttrs.tagName) || 0;
      occurances.set(tagAndAttrs.tagName, o + 1);
      return {
        ...tagAndAttrs,
        occurance: o + 1,
      };
    });

    withOccurances.forEach((tagAndAttrs) => {
      this.logger.log(
        `getInvalidCEAttribute: ${tagAndAttrs.tagName} - ${tagAndAttrs.attrs} - ${tagAndAttrs.occurance}`
      );
    });

    const invalidAttr = withOccurances
      .map(({ tagName, occurance, attrs }) => {
        const ceAttrs = this.ceResource
          .getCEAttributes(tagName)
          .map(({ name }) => name);
        return attrs
          .filter((attr) => !ceAttrs.includes(attr))
          .map((attr) => ({ tagName, occurance, attr }));
      })
      .flat();

    invalidAttr.forEach((attr) => {
      this.logger.log(
        `getInvalidCEAttribute: ${attr.tagName} - ${attr.attr} - ${attr.occurance}`
      );
    });

    return invalidAttr.map(({ tagName, occurance, attr }) => {
      const attrSearchOffset = this.getPositionOfNthTagEnd({
        tagName,
        occurance,
        context,
      });

      const attrStart = context.rawText.indexOf(attr, attrSearchOffset);

      return {
        category: DiagnosticCategory.Error,
        code: 0,
        file: sourceFile,
        start: attrStart,
        length: attr.length,
        messageText: `Unknown attribute: ${attr} for custom element ${tagName}`,
      };
    });
  }

  /**
   * Get the index in a string of the end of a substring tag name, at a given occurance
   */
  private getPositionOfNthTagEnd({
    context,
    tagName,
    occurance,
  }: {
    context: TemplateContext;
    tagName: string;
    occurance: number;
  }): number {
    const rawText = context.rawText;
    let countdown = occurance;
    let stringIndex = 0;

    while (countdown > 0) {
      stringIndex =
        rawText.indexOf(`<${tagName}`, stringIndex) + tagName.length + 1;
      countdown--;
    }

    return stringIndex;
  }
}
