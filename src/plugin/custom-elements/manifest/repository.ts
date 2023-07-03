import { Package } from 'custom-elements-manifest';
import { Logger } from 'typescript-template-language-service-decorator';
import { IOService } from '../../utils';
import { ManifestRepository } from '../custom-elements.types';

/**
 * Thin wrapper implementing the `ManifestResource` interface which
 * reads in a manifest at a given path and exposes it
 */
export class StaticCEManifestRepository implements ManifestRepository {
  constructor(private logger: Logger, io: IOService, projectRoot: string) {
    this.logger.log(`Setting up StaticCEManifestRepository`);
    // TODO: Need to use the service to get the schema FUI-1195
    const maybeSchema = io.readFile(io.getNormalisedRootPath() + 'ce.json');
    if (!maybeSchema) {
      throw new Error(`Searched for schema at ${projectRoot}/ce.json`);
    }

    const schema = JSON.parse(maybeSchema);
    this.manifest = schema as Package;
    this.logger.log(`Finished setting up StaticCEManifestRepository`);
  }

  manifest: Package = { schemaVersion: '0.1.0', modules: [] };
}
