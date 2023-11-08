import { Logger } from 'typescript-template-language-service-decorator';
import { Services } from '../utils/services.types';
import { CEPPluginResistory, Plugin } from './plugins.types';

export class CEPPluginRespistoryImpl implements CEPPluginResistory {
  constructor(
    private logger: Logger,
    private services: Services,
  ) {
    this.logger.log('Setting up CEP Plugin Repository');
  }

  private dynamicImporter = new Function('specifier', 'return import(specifier)');

  loadPlugins(packages: string[]): Promise<Array<Plugin>> {
    return Promise.all(packages.map((pkg) => this.loadPlugin(pkg)));
  }

  private loadPlugin(packageName: string): Promise<Plugin> {
    return new Promise(async (resolve) => {
      try {
        const mPluginLoader = (await this.dynamicImporter(packageName)).default.default as unknown;

        if (typeof mPluginLoader !== 'function') throw new Error('Plugin must export a function');
        resolve(mPluginLoader(this.logger, this.services));
      } catch (e) {
        this.logger.log(`Error loading plugin ${packageName} "${e}". Skipping...`);
        // resolve with blank object so that plugin is skipped
        resolve({});
      }
    });
  }
}
