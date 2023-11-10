import { CompletionEntry, CompletionInfo, ScriptElementKind } from 'typescript/lib/tsserverlibrary';
import { Logger } from 'typescript-template-language-service-decorator';
import { getStore } from '../utils/kvstore';
import { Services } from '../utils/services.types';
import {
  CompletionCtx,
  CompletionsService,
  constructElementAttrCompletion,
  constructGlobalAriaCompletion,
  constructGlobalAttrCompletion,
  constructGlobalEventCompletion,
} from './';

/**
 * Base implementation of the CompletionsService.
 * This should implement every method of the CompletionsService interface.
 *
 * Outputs from this base will then be thread through a completions pipleline
 * and potentially adjusted by other services.
 */
export class CoreCompletionsServiceImpl implements CompletionsService {
  constructor(
    private logger: Logger,
    private services: Services,
  ) {
    logger.log('Setting up Completions Service');
  }

  getCompletionsAtPosition(
    completions: CompletionInfo,
    { typeAndParam }: CompletionCtx,
  ): CompletionInfo {
    const { key, params } = typeAndParam;

    let baseEntries: CompletionEntry[] = [];

    switch (key) {
      case 'tag-name':
        baseEntries = this.getTagCompletions();
        break;

      case 'element-attribute':
        const isUnknownCE =
          params.isCustomElement &&
          !this.services.customElements.customElementKnown(params.tagName);
        const isUnknownPlainElement =
          !params.isCustomElement &&
          !this.services.globalData.getHTMLElementTags().includes(params.tagName);
        if (isUnknownCE || isUnknownPlainElement) {
          baseEntries = this.getTagCompletions();
          break;
        }
        baseEntries = this.getAttributeCompletions(params.tagName, params.isCustomElement);
        break;

      case 'none':
      default:
        // No suggestions
        break;
    }

    return {
      ...completions,
      isMemberCompletion: key === 'element-attribute',
      entries: completions.entries.concat(baseEntries),
    };
  }

  private getAttributeCompletions(tagName: string, isCustomElement: boolean): CompletionEntry[] {
    const attrs = isCustomElement
      ? this.services.customElements.getCEAttributes(tagName)
      : this.services.globalData.getHTMLAttributes(tagName);
    this.logger.log(
      `${
        isCustomElement ? 'custom-element' : 'html-element'
      }-attribute: ${tagName}, ${JSON.stringify(attrs)}`,
    );

    const globalAttrs = getStore(this.logger).TSUnsafeGetOrAdd('global-attributes', () =>
      this.services.globalData
        .getAttributes()
        .map(([name, type]): CompletionEntry => constructGlobalAttrCompletion(name, type))
        .concat(this.services.globalData.getAriaAttributes().map(constructGlobalAriaCompletion))
        .concat(this.services.globalData.getEvents().map(constructGlobalEventCompletion)),
    );

    return attrs.map(constructElementAttrCompletion).concat(globalAttrs);
  }

  private getTagCompletions(): CompletionEntry[] {
    return getStore(this.logger).TSUnsafeGetOrAdd('completion-tag-names', () =>
      this.services.customElements
        .getAllCEInfo({ getFullPath: false })
        .map(({ tagName, path }) => ({
          name: tagName,
          insertText: `${tagName}></${tagName}>`,
          kind: ScriptElementKind.typeElement,
          sortText: 'custom-element',
          labelDetails: {
            description: path,
          },
        }))
        .concat(
          this.services.globalData.getHTMLElementTags().map((tagName) => ({
            name: tagName,
            insertText: `${tagName}></${tagName}>`,
            kind: ScriptElementKind.constElement,
            sortText: 'html-element',
            labelDetails: {
              description: 'HTML Element',
            },
          })),
        ),
    );
  }
}
