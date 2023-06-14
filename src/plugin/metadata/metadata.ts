import { Logger, TemplateContext } from 'typescript-template-language-service-decorator';
import {
  DefinitionInfoAndBoundSpan,
  LineAndCharacter,
  ScriptElementKind,
  TextSpan,
} from 'typescript/lib/tsserverlibrary';
import { getTokenSpanMatchingPattern } from '../utils';
import { Services } from '../utils/services.types';
import { MetadataService } from './metadata.types';

/**
 * Handles metadata requests such as signature and definition info.
 *
 * @privateRemarks Unlikely that these types of actions will be custom element dialect specific
 * (e.g. not FAST or Lit specific) so this is just implemented as a core service, but could
 * be extended using the same pattern as completions and diagnostics in future if required.
 */
export class CoreMetadataService implements MetadataService {
  constructor(private logger: Logger, private services: Services) {
    this.logger.log(`Setting up CoreMetadataService`);
  }

  getDefinitionAndBoundSpan(
    context: TemplateContext,
    position: LineAndCharacter
  ): DefinitionInfoAndBoundSpan {
    const maybeTokenSpan = getTokenSpanMatchingPattern(position, context, /[\w-]/);
    if (!maybeTokenSpan) {
      return {
        textSpan: { start: 0, length: 0 },
      };
    }

    const { start, length } = maybeTokenSpan;
    const token = context.rawText.slice(start, start + length);

    this.logger.log(
      `getDefinitionAndBoundSpan;  maybeTokenSpan: ${JSON.stringify(
        maybeTokenSpan
      )} token: ${token}`
    );

    if (this.services.customElements.customElementKnown(token)) {
      return this.getCustomElementDefinitionInfo(maybeTokenSpan, token);
    }

    return {
      textSpan: maybeTokenSpan,
    };
  }

  private getCustomElementDefinitionInfo(
    tokenSpan: TextSpan,
    tagName: string
  ): DefinitionInfoAndBoundSpan {
    const path = this.services.customElements.getCEPath(tagName, { getFullPath: true });
    if (!path) {
      throw new Error("Couldn't find path for custom element with tagName: " + path);
    }

    return {
      textSpan: tokenSpan,
      definitions: [
        {
          textSpan: { start: 0, length: 0 },
          kind: ScriptElementKind.unknown,
          fileName: this.services.io.getNormalisedRootPath() + '/' + path,
          containerKind: ScriptElementKind.unknown,
          containerName: 'file',
          name: tagName,
        },
      ],
    };
  }
}
