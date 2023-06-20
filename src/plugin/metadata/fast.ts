import { Logger } from 'typescript-template-language-service-decorator';
import { QuickInfo, ScriptElementKind, TextSpan } from 'typescript/lib/tsserverlibrary';
import { CustomElementAttribute } from '../custom-elements/custom-elements.types';
import { stringHeadTail } from '../utils';
import { Services } from '../utils/services.types';
import { PartialMetadataService, QuickInfoCtx } from './metadata.types';

/**
 * Can be used to extend metadata functionality in future.
 */
export class FASTMetadataService implements PartialMetadataService {
  constructor(private logger: Logger, private services: Services) {
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
      typeAndParam.key === 'custom-element-attribute' &&
      this.services.customElements.customElementKnown(typeAndParam.params.tagName)
    ) {
      return this.quickInfoFASTAttribute(tokenSpan, token, typeAndParam.params.tagName);
    }
    return result;
  }

  private quickInfoFASTAttribute(
    tokenSpan: TextSpan,
    attrName: string,
    tagName: string
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
