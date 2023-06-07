import { HTMLElement } from 'node-html-parser';
import { Diagnostic, DiagnosticCategory } from 'typescript/lib/tsserverlibrary';
import { Logger, TemplateContext } from 'typescript-template-language-service-decorator';
import { Services } from '../utils/services.types';
import { DiagnosticCtx, DiagnosticsService } from './diagnostics.types';
import { getPositionOfNthOccuranceEnd } from '../utils';

export class CoreDiagnosticsServiceImpl implements DiagnosticsService {
  constructor(private logger: Logger, private services: Services) {
    logger.log('Setting up Diagnostics');
  }

  getSemanticDiagnostics(ctx: DiagnosticCtx): Diagnostic[] {
    const { context, diagnostics: prevDiagnostics, root } = ctx;
    const elementList = root.querySelectorAll('*');

    const diagnostics = prevDiagnostics
      .concat(this.getUnknownCETag(context, elementList))
      .concat(this.getInvalidCEAttribute(context, elementList));
    return diagnostics;
  }

  /**
   * Get any diagnostic items for custom elements in the tagged template which don't exist
   * in the cache. Return as warnings due to the fact that the custom element may be defined,
   * but not in the cache
   * @param context - TemplateContext from the template language service
   * @param elementList - List of HTMLElements from the template, `HTMLElement` is `from node-html-parser` **not** the standard DOM API.
   * @returns - Array of Diagnostics
   */
  private getUnknownCETag(context: TemplateContext, elementList: HTMLElement[]): Diagnostic[] {
    const sourceFile = context.node.getSourceFile();

    const customElementTags = elementList.filter((elem) => elem.tagName.includes('-'));
    this.logger.log(`getUnknownCETag: customElementTags: ${customElementTags.length}`);

    const ceNames = this.services.customElements.getCENames();
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
        const regex = new RegExp(`<${tag}[>\\s]`, 'g');
        const matchesCount = line.match(regex)?.length ?? 0;

        return Array(matchesCount)
          .fill(0)
          .map((_, i) => ({
            ...tagAndLine,
            column:
              getPositionOfNthOccuranceEnd({
                rawText: line,
                substring: `<${tag}`,
                occurrence: i + 1,
              }) - tag.length,
          }));
      })
      .flat();

    return tagsWithLocations.map(({ tag, row, column }) => ({
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
   * Get any diagnostic items for attributes on known custom elements, which are invalid attributes
   * @param context - TemplateContext from the template language service
   * @param elementList - List of HTMLElements from the template, `HTMLElement` is `from node-html-parser` **not** the standard DOM API.
   * @returns - Array of Diagnostics
   */
  private getInvalidCEAttribute(
    context: TemplateContext,
    elementList: HTMLElement[]
  ): Diagnostic[] {
    const sourceFile = context.node.getSourceFile();
    const ceNames = this.services.customElements.getCENames();

    const tagsAndAttrs = elementList
      .filter((elem) => elem.tagName.includes('-') && ceNames.includes(elem.tagName.toLowerCase()))
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
        const ceAttrs = this.services.customElements
          .getCEAttributes(tagName)
          .map(({ name }) => name);
        return attrs
          .filter((attr) => !ceAttrs.includes(attr))
          .map((attr) => ({ tagName, occurrence, attr }));
      })
      .flat();

    invalidAttr.forEach((attr) => {
      this.logger.log(`getInvalidCEAttribute: ${attr.tagName} - ${attr.attr} - ${attr.occurrence}`);
    });

    const errorAttrs = invalidAttr
      .filter(({ attr }) => !attr.startsWith(':')) // TODO: FUI-1193
      .filter(({ attr }) => attr.replaceAll('x', '').length > 0); // TODO: This might be FAST specific hiding ${ref(_)}

    return errorAttrs.map(({ tagName, occurrence, attr }) => {
      const attrSearchOffset = getPositionOfNthOccuranceEnd({
        substring: `<${tagName}`,
        occurrence,
        rawText: context.rawText,
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
}
