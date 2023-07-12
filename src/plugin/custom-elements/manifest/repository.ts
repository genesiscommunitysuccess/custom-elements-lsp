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
  private subscriber: (() => void) | undefined;
  constructor(private logger: Logger, private io: IOService) {
    this.logger.log(`Setting up StaticCEManifestRepository`);
    this.loadManifest();
  }

  private loadManifest(): void {
    const maybeSchema = this.io.readFile(this.io.getNormalisedRootPath() + 'ce.json');
    if (!maybeSchema) {
      throw new Error(`Searched for schema at ${this.io.getNormalisedRootPath()}/ce.json`);
    }

    const schema = JSON.parse(maybeSchema);
    this.manifest = schema as Package;
    this.logger.log(`Finished reading manifest in StaticCEManifestRepository`);

    this.subscriber?.();
  }

  registerCallbackForPostUpdate(callback: () => void): void {
    this.subscriber = callback;
  }
  async requestUpdate(): Promise<void> {
    this.loadManifest();
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
    dependencies: [],
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

  constructor(
    private logger: Logger,
    private io: IOService,
    private config: SourceAnalyzerConfig,
    private fastEnabled: boolean
  ) {
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
    this.logger.log(
      `Analyzing and updating manifest. Config: ${JSON.stringify(
        this.config
      )}. CWD: ${this.io.getNormalisedRootPath()}`
    );
    if (!this.analyzer) {
      this.analyzer = await getAnalyzerCLI();
    }
    const analyzerArgs = ['analyze', '--globs', this.config.src];
    if (this.fastEnabled) {
      analyzerArgs.push('--fast');
    }
    if (this.config.dependencies.length > 0) {
      analyzerArgs.push('--dependencies');
    }
    const manifest = await this.analyzer({
      argv: analyzerArgs,
      cwd: this.io.getNormalisedRootPath(),
      noWrite: true,
    });
    const dependencies = await this.getDependencies();

    manifest.modules = [...manifest.modules, ...dependencies];
    this.manifest = manifest;

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

  registerCallbackForPostUpdate(callback: () => void): void {
    this.subscriber = callback;
  }

  async requestUpdate(): Promise<void> {
    await this.analyzeAndUpdate();
  }
}
