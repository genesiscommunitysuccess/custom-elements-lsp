import { HTMLElement } from "node-html-parser";
import {
  Logger,
  TemplateContext,
} from "typescript-template-language-service-decorator";
import { Diagnostic, DiagnosticCategory } from "typescript/lib/tsserverlibrary";
import { CustomElementsResource } from "../transformer/custom-elements-resource";

export class DiagnosticsService {
  constructor(
    private logger: Logger,
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
      `getUnknownCETag: customElementTags: ${customElementTags.length}`
    );

    const ceNames = this.ceResource.getCENames();
    const invalidCETags = customElementTags
      .filter((elem) => !ceNames.includes(elem.tagName.toLowerCase()))
      .map((elem) => elem.tagName.toLowerCase());
    const checkTags = [...new Set(invalidCETags)];

    this.logger.log(`getUnknownCETag: checkTags: ${checkTags}`);
    this.logger.log(`getUnknownCETag: rawText: ${context.rawText}`);

    // Loop over each line and build one tag with location object
    // for every match on every line (so a line with two of the same invalid
    // tag will be there twice, with different column values)
    const tagsWithLocations = context.rawText
      .split(/\n/g)
      .map((line, i) => checkTags.map((tag) => ({ line, tag, row: i })))
      .flat()
      .map((tagAndLine) => {
        const { line, tag } = tagAndLine;
        const regex = new RegExp(`<${tag}[>\s]`, "g");
        const matchesCount = line.match(regex)?.length ?? 0;

        return Array(matchesCount)
          .fill(0)
          .map((_, i) => ({
            ...tagAndLine,
            column:
              this.getPositionOfNthTagEnd({
                context: {
                  rawText: line,
                },
                tagName: tag,
                occurrence: i + 1,
              }) - tag.length,
          }));
      })
      .flat();

    return tagsWithLocations.map(({ line, tag, row, column }) => ({
      category: DiagnosticCategory.Warning,
      code: 0,
      file: sourceFile,
      start: context.toOffset({
        line: row,
        character: column,
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

    const occurrences: Map<string, number> = new Map();

    const withOccurrences = tagsAndAttrs.map((tagAndAttrs) => {
      const o = occurrences.get(tagAndAttrs.tagName) || 0;
      occurrences.set(tagAndAttrs.tagName, o + 1);
      return {
        ...tagAndAttrs,
        occurrence: o + 1,
      };
    });

    withOccurrences.forEach((tagAndAttrs) => {
      this.logger.log(
        `getInvalidCEAttribute: ${tagAndAttrs.tagName} - ${tagAndAttrs.attrs} - ${tagAndAttrs.occurrence}`
      );
    });

    const invalidAttr = withOccurrences
      .map(({ tagName, occurrence, attrs }) => {
        const ceAttrs = this.ceResource
          .getCEAttributes(tagName)
          .map(({ name }) => name);
        return attrs
          .filter((attr) => !ceAttrs.includes(attr))
          .map((attr) => ({ tagName, occurrence, attr }));
      })
      .flat();

    invalidAttr.forEach((attr) => {
      this.logger.log(
        `getInvalidCEAttribute: ${attr.tagName} - ${attr.attr} - ${attr.occurrence}`
      );
    });

    return invalidAttr.map(({ tagName, occurrence, attr }) => {
      const attrSearchOffset = this.getPositionOfNthTagEnd({
        tagName,
        occurrence,
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
   * Get the index in a string of the end of a substring tag name, at a given occurrence
   */
  private getPositionOfNthTagEnd({
    context,
    tagName,
    occurrence,
  }: {
    context: {
      rawText: string;
    };
    tagName: string;
    occurrence: number;
  }): number {
    if (occurrence < 1) {
      return -2;
    }
    const rawText = context.rawText;
    let countdown = occurrence;
    let stringIndex = 0;

    while (countdown > 0) {
      const nextOccurrenceIndex = rawText.indexOf(`<${tagName}`, stringIndex);
      if (nextOccurrenceIndex === -1) {
        return -1;
      }
      stringIndex = nextOccurrenceIndex + tagName.length + 1;
      countdown--;
    }

    return stringIndex;
  }
}
