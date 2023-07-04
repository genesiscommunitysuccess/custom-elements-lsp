import { Package } from 'custom-elements-manifest';
import { Logger } from 'typescript-template-language-service-decorator';
import chokidar from 'chokidar';
import debounce from 'debounce';
import { IOService } from '../../utils';
import { ManifestRepository, SourceAnalyzerConfig } from '../custom-elements.types';
import { AnalyzerCLI, getAnalyzerCLI } from './analyzer';

/**
 * Thin wrapper implementing the `ManifestRepository` interface which
 * reads in a manifest at a given path and exposes it
 */
export class StaticCEManifestRepository implements ManifestRepository {
  constructor(private logger: Logger, private io: IOService) {
    this.logger.log(`Setting up StaticCEManifestRepository`);
    // TODO: Need to use the service to get the schema FUI-1195
    const maybeSchema = io.readFile(io.getNormalisedRootPath() + 'ce.json');
    if (!maybeSchema) {
      throw new Error(`Searched for schema at ${io.getNormalisedRootPath()}/ce.json`);
    }

    const schema = JSON.parse(maybeSchema);
    this.manifest = schema as Package;
    this.logger.log(`Finished setting up StaticCEManifestRepository`);
  }

  manifest: Package = { schemaVersion: '0.1.0', modules: [] };
}

/**
 * Sets the defaults values for `SourceAnalyzerConfig` for values which are not configured by the user.
 */
export const mixinParserConfigDefaults = (
  config: Partial<SourceAnalyzerConfig> | undefined
): SourceAnalyzerConfig => {
  const inputConfig = config ?? {};
  return {
    timeout: 5000,
    src: 'src/**/*.{js,ts}',
    dependencies: 'node_modules/**/custom-elements.json',
    ...inputConfig,
  };
};

/**
 * Constantly updates the manifest in the background, configured via
 * the `.tsconfig.json` file.
 */
export class LiveUpdatingCEManifestRepository implements ManifestRepository {
  constructor(private logger: Logger, private io: IOService, private config: SourceAnalyzerConfig) {
    this.logger.log(`Setting up LiveUpdatingCEManifestRepository`);

    const fileWatcher = chokidar.watch(this.config.src, { cwd: this.io.getNormalisedRootPath() });
    const onChange = debounce(this.analyzeAndUpdate, this.config.timeout).bind(this);
    fileWatcher.addListener('change', onChange);
    fileWatcher.addListener('unlink', onChange);
  }

  private async analyzeAndUpdate() {
    this.logger.log(`Analyzing and updating manifest. Config: ${JSON.stringify(this.config)}`);
    if (!this.analyzer) {
      this.analyzer = await getAnalyzerCLI();
    }
    const analyzerArgs = [
      'analyze',
      '--fast', // TODO: don't hard code this if we ever want to be generic
      '--globs',
      this.config.src,
    ];
    const manifest = await this.analyzer({
      argv: analyzerArgs,
      cwd: this.io.getNormalisedRootPath(),
      noWrite: true,
    });
    this.logger.log('Hello-moto');
    this.logger.log(JSON.stringify(manifest));
    // TODO: Need to invalidate cache
    // TODO: Need to read dependencies
  }

  manifest: Package = { schemaVersion: '0.1.0', modules: [] };
  private analyzer: AnalyzerCLI | undefined;
}
