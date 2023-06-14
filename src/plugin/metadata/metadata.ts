import { Logger, TemplateContext } from 'typescript-template-language-service-decorator';
import {
  DefinitionInfoAndBoundSpan,
  LineAndCharacter,
  ScriptElementKind,
} from 'typescript/lib/tsserverlibrary';
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
    this.logger.log('Setting up CoreMetadataService');
  }

  getDefinitionAndBoundSpan(
    context: TemplateContext,
    position: LineAndCharacter
  ): DefinitionInfoAndBoundSpan {
    return {
      textSpan: {
        start: context.toOffset(position),
        length: 2,
      },
      definitions: [
        {
          textSpan: { start: 15, length: 5 },
          kind: ScriptElementKind.unknown,
          fileName: '/Users/matt.walker/genesis/custom-elements-lsp/example/src/root.ts',
          containerKind: ScriptElementKind.unknown,
          containerName: 'root',
          name: 'hi',
        },
      ],
    };
  }
}
