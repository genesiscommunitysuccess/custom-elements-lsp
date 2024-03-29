import {
  CustomElementAttribute,
  PartialMetadataService,
  QuickInfoCtx,
  Services,
  utils,
} from '@genesiscommunitysuccess/custom-elements-lsp/out/main/plugins/export-interface';
import { QuickInfo, ScriptElementKind, TextSpan } from 'typescript/lib/tsserverlibrary';
import { Logger } from 'typescript-template-language-service-decorator';

const { stringHeadTail } = utils.strings;

/**
 */
export class FASTMetadataService implements PartialMetadataService {
  constructor(
    private logger: Logger,
    private services: Services,
  ) {
    this.logger.log(`Setting up FAST enhanced FASTMetadataService`);
  }

  getQuickInfoAtPosition({
    result,
    typeAndParam,
    tokenSpan,
    token,
  }: QuickInfoCtx): QuickInfo | undefined {
    if (
      typeof result === 'undefined' &&
      typeAndParam.key === 'element-attribute' &&
      this.services.customElements.customElementKnown(typeAndParam.params.tagName)
    ) {
      return this.quickInfoFASTAttribute(tokenSpan, token, typeAndParam.params.tagName);
    }
    return result;
  }

  private quickInfoFASTAttribute(
    tokenSpan: TextSpan,
    attrName: string,
    tagName: string,
  ): QuickInfo | undefined {
    let maybeRes: Partial<CustomElementAttribute> | undefined = undefined;
    let type: 'attribute' | 'event' | 'property' = 'attribute';
    const [prefix, attr] = stringHeadTail(attrName);

    if (prefix === '?') {
      maybeRes = this.services.customElements
        .getCEAttributes(tagName)
        .find(({ name }) => name === attr);
    } else if (prefix === '@') {
      maybeRes = this.services.customElements.getAllEvents().find(({ name }) => name === attr);
      type = 'event';
    } else if (prefix === ':') {
      maybeRes = this.services.customElements
        .getCEMembers(tagName)
        .find(({ name }) => name === attr);
      type = 'property';
    }

    if (typeof maybeRes === 'undefined') {
      return undefined;
    }

    return {
      textSpan: tokenSpan,
      kind: ScriptElementKind.parameterElement,
      kindModifiers: 'declare',
      displayParts: [
        {
          kind: 'text',
          text: `(${type}-binding) ${attrName}${
            maybeRes.referenceClass ? ` [${maybeRes.referenceClass}]` : ''
          }`,
        },
        {
          kind: 'text',
          text: `\n\`${maybeRes.type}\`${maybeRes.deprecated ? ' (deprecated)' : ''}`,
        },
      ],
      documentation:
        maybeRes.description && type !== 'event'
          ? [{ kind: 'text', text: '\n' + maybeRes.description }]
          : [],
    };
  }
}
