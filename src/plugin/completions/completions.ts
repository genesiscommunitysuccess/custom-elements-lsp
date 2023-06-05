import { CompletionEntry, CompletionInfo, ScriptElementKind } from 'typescript/lib/tsserverlibrary';
import { Logger } from 'typescript-template-language-service-decorator';
import { getStore } from '../utils/kvstore';
import { Services } from '../utils/services.type';
import {
  CompletionCtx,
  CompletionsService,
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
  constructor(private logger: Logger, private services: Services) {
    logger.log('Setting up Completions Service');
  }

  getCompletionsAtPosition(
    completions: CompletionInfo,
    { typeAndParam }: CompletionCtx
  ): CompletionInfo {
    const { key, params } = typeAndParam;

    let baseEntries: CompletionEntry[] = [];

    switch (key) {
      case 'custom-element-name':
        baseEntries = this.getTagCompletions();
        break;

      case 'custom-element-attribute':
        if (!this.services.customElements.customElementKnown(params)) {
          baseEntries = this.getTagCompletions();
          break;
        }
        baseEntries = this.getAttributeCompletions(params);
        break;

      case 'none':
      default:
        // No suggestions
        break;
    }

    return {
      ...completions,
      isMemberCompletion: key === 'custom-element-attribute',
      entries: completions.entries.concat(baseEntries),
    };
  }

  private getAttributeCompletions(tagName: string): CompletionEntry[] {
    const attrs = this.services.customElements.getCEAttributes(tagName);
    this.logger.log(`custom-element-attribute: ${tagName}, ${JSON.stringify(attrs)}`);

    const globalAttrs = getStore(this.logger).TSUnsafeGetOrAdd('global-attributes', () =>
      this.services.globalData
        .getAttributes()
        .map(([name, type]): CompletionEntry => constructGlobalAttrCompletion(name, type))
        .concat(this.services.globalData.getAriaAttributes().map(constructGlobalAriaCompletion))
        .concat(this.services.globalData.getEvents().map(constructGlobalEventCompletion))
    );

    return attrs
      .map(
        ({ name, type, referenceClass, deprecated }): CompletionEntry => ({
          name,
          insertText: `${name}${type === 'boolean' ? '' : '=""'}`,
          kind: ScriptElementKind.parameterElement,
          sortText: 'a',
          labelDetails: {
            description: (deprecated ? '(deprecated) ' : '') + `[attr] ${referenceClass}`,
            detail: ` ${type}`,
          },
          kindModifiers: deprecated ? 'deprecated' : '',
        })
      )
      .concat(globalAttrs);
  }

  private getTagCompletions(): CompletionEntry[] {
    return this.services.customElements
      .getCEInfo({ getFullPath: false })
      .map(({ tagName: name, path }) => ({
        name: name,
        insertText: `${name}></${name}>`,
        kind: ScriptElementKind.typeElement,
        sortText: 'custom-element',
        labelDetails: {
          description: path,
        },
      }));
  }
}
