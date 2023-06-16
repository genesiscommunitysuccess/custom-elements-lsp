import { Logger } from 'typescript-template-language-service-decorator';
import { QuickInfo } from 'typescript/lib/tsserverlibrary';
import { Services } from '../utils/services.types';
import { PartialMetadataService, QuickInfoCtx } from './metadata.types';

export class FASTMetadataService implements PartialMetadataService {
  constructor(private logger: Logger, private services: Services) {
    this.logger.log(`Setting up FAST enhanced FASTMetadataService`);
  }

  getQuickInfoAtPosition({ token, result }: QuickInfoCtx): QuickInfo | undefined {
    if (typeof result !== 'undefined' || this.services.customElements.customElementKnown(token)) {
      return this.augmentTagnameQuickInfoWithFASTInfo(result as QuickInfo, token);
    }

    return result;
  }

  private augmentTagnameQuickInfoWithFASTInfo(quickInfo: QuickInfo, tagName: string): QuickInfo {
    if (!this.services.customElements.customElementKnown(tagName)) {
      throw new Error(
        `FASTMetadataService: Unable to get quickinfo for unknown custom element: "${tagName}"`
      );
    }

    let documentation = quickInfo.documentation || [];

    documentation = documentation.concat(
      this.services.customElements
        .getCEMembers(tagName)
        .filter(({ deprecated }) => !deprecated)
        .map(({ name, type, privacy = 'public', isStatic }, i) => ({
          kind: '[property]',
          text:
            (i === 0 ? '\n\nProperties (FAST):' : '') +
            `\n\`${privacy} ${isStatic ? 'static ' : ''}:${name} ${type}\``,
        }))
    );

    return {
      ...quickInfo,
      documentation,
    };
  }
}
