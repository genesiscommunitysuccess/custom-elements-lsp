import { Logger } from 'typescript-template-language-service-decorator';
import { QuickInfo } from 'typescript/lib/tsserverlibrary';
import { Services } from '../utils/services.types';
import { PartialMetadataService, QuickInfoCtx } from './metadata.types';

/**
 * Can be used to extend metadata functionality in future.
 */
export class FASTMetadataService implements PartialMetadataService {
  constructor(private logger: Logger, private services: Services) {
    this.logger.log(`Setting up FAST enhanced FASTMetadataService`);
  }

  getQuickInfoAtPosition({ result }: QuickInfoCtx): QuickInfo | undefined {
    return result;
  }
}
