import { HTMLElement } from 'node-html-parser';
import { Diagnostic, DiagnosticCategory } from 'typescript/lib/tsserverlibrary';
import { Logger, TemplateContext } from 'typescript-template-language-service-decorator';
import {
  DEPRECATED_ATTRIBUTE,
  DUPLICATE_ATTRIBUTE,
  UNKNOWN_ATTRIBUTE,
  UNKNOWN_CUSTOM_ELEMENT,
  UNKNOWN_HTML_ELEMENT,
} from '../constants/diagnostic-codes';
import { CustomElementAttribute } from '../custom-elements/custom-elements.types';
import { escapeRegExp, getPositionOfNthOccuranceEnd, parseAttrNamesFromRawString } from '../utils';
import { getStore } from '../utils/kvstore';
import { Services } from '../utils/services.types';
import {
  ATTIBUTE_CLASSIFICATION,
  DiagnosticCtx,
  DiagnosticsService,
  InvalidAttrDefinition,
  TagsWithAttrs,
} from './diagnostics.types';

export class CoreDiagnosticsServiceImpl implements DiagnosticsService {
  constructor(
    private logger: Logger,
    private services: Services,
  ) {
    this.logger.log('Setting up Diagnostics');
  }

  getSemanticDiagnostics(ctx: DiagnosticCtx): Diagnostic[] {
    const { context, diagnostics: prevDiagnostics, root } = ctx;
    const elementList = root.querySelectorAll('*');

    const diagnostics = prevDiagnostics
      .concat(this.diagnosticsUnknownTags(context, elementList))
      .concat(this.diagnosticsInvalidElemAttribute(context, elementList));
    return diagnostics;
  }

  /**
   * Get any diagnostic items for elements in the tagged template which don't exist
   * in the cache. Return as warnings for custom elements due to the fact that the custom element may be defined,
   * but not in the cache. Errors for unknown html tags.
   * @param context - TemplateContext from the template language service
   * @param elementList - List of HTMLElements from the template, `HTMLElement` is `from node-html-parser` **not** the standard DOM API.
   * @returns - Array of Diagnostics
   */
  private diagnosticsUnknownTags(
    context: TemplateContext,
    elementList: HTMLElement[],
  ): Diagnostic[] {
    const sourceFile = context.node.getSourceFile();

    const validTagNames = this.services.customElements
      .getCENames()
      .concat(this.services.globalData.getHTMLElementTags());
    const invalidTagNames = elementList
      .filter((elem) => !validTagNames.includes(elem.tagName.toLowerCase()))
      .map((elem) => elem.tagName.toLowerCase());
    const checkTags = [...new Set(invalidTagNames)];

    this.logger.log(`diagnosticsUnknownTags: checkTags: ${checkTags}`);
    this.logger.log(`diagnosticsUnknownTags: rawText: ${context.rawText}`);

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
                matcher: `<${tag}`,
                occurrence: i + 1,
              }) - tag.length,
          }));
      })
      .flat();

    return tagsWithLocations.map(({ tag, row, column }) => {
      const isCE = tag.includes('-');
      return {
        category: isCE ? DiagnosticCategory.Warning : DiagnosticCategory.Error,
        code: isCE ? UNKNOWN_CUSTOM_ELEMENT : UNKNOWN_HTML_ELEMENT,
        file: sourceFile,
        start: context.toOffset({
          line: row,
          character: column,
        }),
        length: tag.length,
        messageText: `Unknown ${isCE ? 'custom ' : ''}element: ${tag}`,
      };
    });
  }

  /**
   * Get any diagnostic items for attributes on known custom elements, which are invalid attributes
   * @param context - TemplateContext from the template language service
   * @param elementList - List of HTMLElements from the template, `HTMLElement` is `from node-html-parser` **not** the standard DOM API.
   * @returns - Array of Diagnostics
   */
  private diagnosticsInvalidElemAttribute(
    context: TemplateContext,
    elementList: HTMLElement[],
  ): Diagnostic[] {
    const sourceFile = context.node.getSourceFile();
    const validTagNames = this.services.customElements
      .getCENames()
      .concat(this.services.globalData.getHTMLElementTags());

    const tagsAndAttrs = elementList
      .filter((elem) => validTagNames.includes(elem.tagName.toLowerCase()))
      .map((elem) => ({
        tagName: elem.tagName.toLowerCase(),
        attrs: parseAttrNamesFromRawString(elem.rawAttrs),
      }));

    const occurrences: Map<string, number> = new Map();
    const withOccurrences: TagsWithAttrs[] = tagsAndAttrs.map((tagAndAttrs) => {
      const o = occurrences.get(tagAndAttrs.tagName) || 0;
      occurrences.set(tagAndAttrs.tagName, o + 1);
      return {
        ...tagAndAttrs,
        tagNameOccurrence: o + 1,
      };
    });

    const errorAttrs = this.buildInvalidAttrDefinitions(withOccurrences);

    return errorAttrs
      .filter(({ attr }) => attr.replaceAll('x', '').length > 0)
      .map(({ tagName, tagNameOccurrence, attr, attrOccurrence, classification }) => {
        let searchOffset = getPositionOfNthOccuranceEnd({
          matcher: `<${tagName}`,
          occurrence: tagNameOccurrence,
          rawText: context.rawText,
        });

        /**
         * If the attribute is a binding type (used in dialects such as FAST) then
         * we can avoid matching on substrings just by appending `=` to the match.
         * Else, we can avoid substring matches using the word boundary matcher `\b`.
         * If we are using a binding type we need to subtract 1 account for the
         * `=` character.
         */
        const [matcher, offset] = /[@:?]/.test(attr)
          ? [new RegExp(escapeRegExp(attr) + '='), 1]
          : [new RegExp(`\\b${escapeRegExp(attr)}\\b`), 0];

        searchOffset += getPositionOfNthOccuranceEnd({
          matcher,
          occurrence: attrOccurrence,
          rawText: context.rawText.substring(searchOffset),
        });

        const attrStart = searchOffset - attr.length - offset;

        return this.buildAttributeDiagnosticMessage(
          classification,
          attr,
          tagName,
          sourceFile,
          attrStart,
          attr.length,
        );
      });
  }

  private buildGlobalAttributeArray(): [string, CustomElementAttribute][] {
    const globalAttrWithAriaTuples = getStore(this.logger).TSUnsafeGetOrAdd(
      'global-attribute-with-aria-tuples',
      () => {
        const globalAttrTuples: [string, CustomElementAttribute][] = this.services.globalData
          .getAttributes()
          .map(([attr, type]) => [attr, { name: attr, type, deprecated: false }]);
        const globalAttrAriaTuples: [string, CustomElementAttribute][] = this.services.globalData
          .getAriaAttributes()
          .map((attr) => [attr, { name: attr, type: 'string', deprecated: false }]);
        return globalAttrTuples.concat(globalAttrAriaTuples);
      },
    );
    return globalAttrWithAriaTuples;
  }

  private buildInvalidAttrDefinitions(tagsWithAttrs: TagsWithAttrs[]): InvalidAttrDefinition[] {
    return tagsWithAttrs
      .map(({ tagName, tagNameOccurrence, attrs }) => {
        const attrOccurences: Map<string, number> = new Map();

        const elemsAttrs = tagName.includes('-')
          ? this.services.customElements.getCEAttributes(tagName)
          : this.services.globalData.getHTMLAttributes(tagName);
        // Construct a map from tuples of [key, value] => [attrName, attrDef]
        // concatenating this elements attributes with the global attributes
        const attrMap = new Map(
          elemsAttrs
            .map((elemAttr) => [elemAttr.name, elemAttr] as const)
            .concat(this.buildGlobalAttributeArray()),
        );

        return attrs
          .map((attr) => {
            let classification: ATTIBUTE_CLASSIFICATION = 'valid';
            const occurr = attrOccurences.get(attr) || 0;
            attrOccurences.set(attr, occurr + 1);
            if (attrMap.get(attr)?.deprecated) {
              classification = 'deprecated';
            }
            if (occurr >= 1) {
              classification = 'duplicate';
            }
            if (!(attrMap.has(attr) || attr.startsWith('data-'))) {
              classification = 'unknown';
            }
            return {
              tagName,
              tagNameOccurrence,
              attr,
              attrOccurrence: occurr + 1,
              classification,
            };
          })
          .filter(({ classification }) => classification !== 'valid');
      })
      .flat();
  }

  private buildAttributeDiagnosticMessage(
    classification: ATTIBUTE_CLASSIFICATION,
    attrName: string,
    tagName: string,
    file: ts.SourceFile,
    start: number,
    length: number,
  ): Diagnostic {
    const isCE = tagName.includes('-');
    switch (classification) {
      case 'valid':
        throw new Error(
          'buildAttributeDiagnosticMessage: cannot build message for valid attribute',
        );
      case 'unknown':
        return {
          category: DiagnosticCategory.Error,
          code: UNKNOWN_ATTRIBUTE,
          messageText: `Unknown attribute "${attrName}" for ${
            isCE ? 'custom ' : ''
          }element "${tagName}"`,
          file,
          start,
          length,
        };
      case 'duplicate':
        return {
          category: DiagnosticCategory.Warning,
          code: DUPLICATE_ATTRIBUTE,
          messageText: `Duplicate setting of attribute "${attrName}" which overrides the same attribute previously set on tag "${tagName}"`,
          file,
          start,
          length,
          reportsUnnecessary: {},
        };
      case 'deprecated':
        return {
          category: DiagnosticCategory.Warning,
          code: DEPRECATED_ATTRIBUTE,
          messageText: `Attribute "${attrName}" is marked as deprecated and may become invalid for ${
            isCE ? 'custom ' : ''
          }element ${tagName}`,
          file,
          start,
          length,
          reportsDeprecated: {},
        };
    }
  }
}
