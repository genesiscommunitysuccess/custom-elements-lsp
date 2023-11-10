import { CEPPluginService, CEPPluginResistory, Plugin } from './plugins.types';

export class CEPPluginServiceImpl implements CEPPluginService {
  constructor(private repo: CEPPluginResistory) {}
  loadPlugins(packages: string[]): Promise<Plugin[]> {
    return this.repo.loadPlugins(packages);
  }
}
