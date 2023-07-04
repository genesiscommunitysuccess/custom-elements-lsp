import { Package } from 'custom-elements-manifest';
import path from 'path';
import { Logger } from 'typescript-template-language-service-decorator';
import chokidar from 'chokidar';
import debounce from 'debounce';
import { IOService } from '../../utils';
import { ManifestRepository, SourceAnalyzerConfig } from '../custom-elements.types';
import { AnalyzerCLI, getAnalyzerCLI, getGlobby } from './analyzer';

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

  callbackAfterUpdate(_: () => void): void {}
  async requestUpdate(): Promise<void> {}

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
    // TODO: These should be configured in tsconfig.json
    dependencies: [
      'node_modules/example-lib/**/custom-elements.json',
      '!**/@custom-elements-manifest/**/*',
    ],
    ...inputConfig,
  };
};

/**
 * Constantly updates the manifest in the background, configured via
 * the `.tsconfig.json` file.
 */
export class LiveUpdatingCEManifestRepository implements ManifestRepository {
  manifest: Package = { schemaVersion: '0.1.0', modules: [] };
  private analyzer: AnalyzerCLI | undefined;
  private dependencies: Package['modules'] | undefined;
  private subscriber: (() => void) | undefined;

  constructor(private logger: Logger, private io: IOService, private config: SourceAnalyzerConfig) {
    this.logger.log(`Setting up LiveUpdatingCEManifestRepository`);

    const fileWatcher = chokidar.watch(this.config.src, { cwd: this.io.getNormalisedRootPath() });
    const onChange = debounce(this.analyzeAndUpdate, this.config.timeout).bind(this);
    fileWatcher.addListener('change', onChange);
    fileWatcher.addListener('unlink', onChange);
  }

  /**
   * Calling this function will cause the cache to become invalid
   * if it contains any custom element data. The caller can listen
   * for this event by registering a callback with `callbackAfterUpdate`.
   */
  private async analyzeAndUpdate(): Promise<void> {
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
    const dependencies = await this.getDependencies();
    this.logger.log(JSON.stringify(manifest));
    this.logger.log('Hello-moto');
    this.logger.log(`Deps : ${JSON.stringify(dependencies)}`);

    manifest.modules = [...manifest.modules, ...dependencies];
    this.manifest = manifest;

    this.logger.log(`Manifest: ${JSON.stringify(this.manifest)}`);
    this.subscriber?.();
  }

  private async getDependencies(): Promise<Package['modules']> {
    if (this.dependencies) {
      return this.dependencies;
    }

    const modules: Package['modules'] = [];
    const globby = await getGlobby();
    const libFiles = await globby(this.config.dependencies, {
      cwd: this.io.getNormalisedRootPath(),
    });
    for (const libFile of libFiles) {
      const libDir = path.dirname(libFile);
      this.logger.log(`Found dependency ${libFile} in ${libDir}`);
      const lib = JSON.parse(
        this.io.readFile(this.io.getNormalisedRootPath() + libFile) || '{"modules": []}'
      );

      lib.modules.forEach((mod: Package['modules'][number]) => {
        mod.path = path.join(libDir, mod.path);
        modules.push(mod);
      });
    }
    this.dependencies = modules;
    return this.dependencies;
  }

  callbackAfterUpdate(callback: () => void): void {
    this.subscriber = callback;
  }

  async requestUpdate(): Promise<void> {
    await this.analyzeAndUpdate();
  }
}
