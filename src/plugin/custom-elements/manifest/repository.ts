import { Package } from 'custom-elements-manifest';
import { Logger } from 'typescript-template-language-service-decorator';
import chokidar from 'chokidar';
import debounce from 'debounce';
import { IOService } from '../../utils';
import { ManifestRepository, SourceAnalyzerConfig } from '../custom-elements.types';

/**
 * Thin wrapper implementing the `ManifestRepository` interface which
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

/**
 * Constantly updates the manifest in the background, configured via
 * the `.tsconfig.json` file.
 */
export class LiveUpdatingCEManifestRepository implements ManifestRepository {
  constructor(
    private logger: Logger,
    io: IOService,
    config: Partial<SourceAnalyzerConfig>,
    projectRoot: string
  ) {
    this.logger.log(`Setting up LiveUpdatingCEManifestRepository`);

    this.config = {
      timeout: 5000,
      // src: projectRoot + 'src/**/*.{js,ts}',
      // src: 'src/**/*.{js,ts}',
      // src: '.',
      src: '/**/*.{js,ts}',
      dependencies: 'node_modules/**/custom-elements.json',
      ...config,
    };

    const fileWatcher = chokidar.watch('**/*.{js,ts}', { cwd: '/Users/matt.walker/Documents/HR/' });
    const onChange = debounce(this.analyzeAndUpdate, 100);
    fileWatcher.addListener('change', onChange);
    fileWatcher.addListener('unlink', onChange);
    this.logger.log(
      `Watching directories for source files: ${JSON.stringify(fileWatcher.getWatched())}`
    );
  }

  private analyzeAndUpdate() {
    this.logger.log('hello-moto');
    this.logger.log(`Analyzing and updating manifest. Config: ${JSON.stringify(this.config)}`);
    // TODO: Need to invalidate cache
  }

  manifest: Package = { schemaVersion: '0.1.0', modules: [] };
  private config: SourceAnalyzerConfig;
}
