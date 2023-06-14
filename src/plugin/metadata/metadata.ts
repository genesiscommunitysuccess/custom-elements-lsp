import { Logger } from 'typescript-template-language-service-decorator';
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
}
