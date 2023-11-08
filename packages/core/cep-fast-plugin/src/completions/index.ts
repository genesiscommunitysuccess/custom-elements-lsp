import {
  CompletionCtx,
  PartialCompletionsService,
  Services,
} from '@genesiscommunitysuccess/custom-elements-lsp';
import { utils } from '@genesiscommunitysuccess/custom-elements-lsp/out/plugins/export-interface';
import {
  CompletionEntry,
  CompletionInfo,
  LineAndCharacter,
  ScriptElementKind,
  TextSpan,
} from 'typescript/lib/tsserverlibrary';
import { Logger, TemplateContext } from 'typescript-template-language-service-decorator';

const { getWholeTextReplacementSpan } = utils.strings;

/**
 * If Microsoft FAST config is enabled then this service will provide
 * enhanced completions for FAST templating syntax.
 *
 * @remarks This should be used in conjunction with the CoreCompletionsServiceImpl
 * or another class which fully implements the CompletionsService interface.
 *
 * @privateRemarks as a PartialCompletionsService this class is not required to
 * implement every method of the CompletionsService interface if not required
 * for FAST.
 */
export class FASTCompletionsService implements PartialCompletionsService {
  constructor(
    private logger: Logger,
    private services: Services,
  ) {
    this.logger.log('Setting up FAST Enhancement Completions Service');
  }

  getCompletionsAtPosition(
    completions: CompletionInfo,
    { typeAndParam, position, context }: CompletionCtx,
  ): CompletionInfo {
    this.logger.log(`FASTCompletionsService typeAndParam: ${JSON.stringify(typeAndParam)}`);
    const { key, params } = typeAndParam;

    let entries = completions.entries;

    switch (key) {
      case 'element-attribute':
        entries = this.getUpdatedAttributeEntries(entries, position, context, params.tagName);
        this.logger.log(`entries: ${JSON.stringify(entries)}`);
        break;
    }

    return {
      ...completions,
      entries,
    };
  }

  private getUpdatedAttributeEntries(
    completions: CompletionEntry[],
    position: LineAndCharacter,
    context: TemplateContext,
    tagName: string,
  ): CompletionEntry[] {
    const replacementSpan = getWholeTextReplacementSpan(position, context);
    const withConvertedEvents = this.convertFastEventAttributes(completions, replacementSpan);
    const withBooleanBindings = this.addDynamicBooleanBindings(
      withConvertedEvents,
      replacementSpan,
    );
    const withElementsEvents = this.addAllElementsEventCompletions(
      withBooleanBindings,
      replacementSpan,
    );
    const withElementMembers = this.addElementMembers(withElementsEvents, replacementSpan, tagName);
    return withElementMembers;
  }

  private addElementMembers(
    completions: CompletionEntry[],
    replacementSpan: TextSpan,
    tagName: string,
  ): CompletionEntry[] {
    return completions.concat(
      this.services.customElements
        .getCEMembers(tagName)
        .map(({ name, referenceClass, deprecated, type, privacy, isStatic }) => ({
          name: `:${name}`,
          insertText: `:${name}="\${(x) => $1}"$0`,
          kind: ScriptElementKind.parameterElement,
          sortText: 'c',
          labelDetails: {
            description: (deprecated ? '(deprecated) ' : '') + `[prop] ${referenceClass}`,
            detail: ` ${type}`,
          },
          isSnippet: true,
          replacementSpan,
          kindModifiers: privacy + (isStatic ? ',static' : '') + (deprecated ? ',deprecated' : ''),
        })),
    );
  }

  private addAllElementsEventCompletions(
    completions: CompletionEntry[],
    replacementSpan: TextSpan,
  ): CompletionEntry[] {
    return completions.concat(
      this.services.customElements.getAllEvents().map(({ name, referenceClass }) => ({
        name: `@${name}`,
        insertText: `@${name}="\${(x, c) => $1}"$0`,
        kind: ScriptElementKind.parameterElement,
        sortText: 'f',
        labelDetails: {
          description: `[attr] ${referenceClass}`,
        },
        isSnippet: true,
        replacementSpan,
      })),
    );
  }

  private addDynamicBooleanBindings(
    completions: CompletionEntry[],
    replacementSpan: TextSpan,
  ): CompletionEntry[] {
    return completions
      .map((completion) => {
        const completionInArr = [completion];
        if (completion?.labelDetails?.detail?.includes('boolean')) {
          completionInArr.push({
            ...completion,
            name: `?${completion.name}`,
            insertText: `?${completion.name}="\${(x) => $1}"$0`,
            isSnippet: true,
            replacementSpan,
            labelDetails: {
              ...completion.labelDetails,
              detail: ' boolean binding',
            },
          });
        }
        return completionInArr;
      })
      .flat();
  }

  private convertFastEventAttributes(
    completions: CompletionEntry[],
    replacementSpan: TextSpan,
  ): CompletionEntry[] {
    return completions.map((completion) => {
      if (completion?.labelDetails?.detail?.includes('event')) {
        return {
          ...completion,
          name: completion.name.replace('on', '@'),
          insertText: completion.insertText?.replace('on', '@').replace('""', '"${(x,c) => $1}"$0'),
          isSnippet: true,
          replacementSpan,
        };
      }
      return completion;
    });
  }
}
