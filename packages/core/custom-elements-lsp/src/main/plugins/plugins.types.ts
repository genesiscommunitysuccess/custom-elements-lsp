import { Logger } from 'typescript-template-language-service-decorator';
import { PartialCompletionsService } from '../completions';
import { PartialDiagnosticsService } from '../diagnostics/diagnostics.types';
import { PartialMetadataService } from '../metadata';
import { Services } from '../utils/services.types';

/**
 * The type that must be exported from a plugin to be loaded
 */
export type Plugin = {
  completions?: PartialCompletionsService[];
  diagnostics?: PartialDiagnosticsService[];
  metadata?: PartialMetadataService[];
};
export type CEPPlugin = (logger: Logger, services: Services, userConfig: PluginConfig) => Plugin;

export interface CEPPluginResistory {
  loadPlugins(packages: string[]): Promise<Array<Plugin>>;
}

export interface CEPPluginService {
  loadPlugins(packages: string[]): Promise<Array<Plugin>>;
}

/**
 * The type of the config which is defined in the tsconfig.json
 * and is dependency injected into any plugin on init
 */
export type PluginConfig = {
  srcRouteFromTSServer?: string;
  designSystemPrefix?: string;
  parser?: {
    timeout?: number;
    fastEnable?: boolean;
    src?: string;
    dependencies?: string[];
  };
  plugins?: string[];
};
