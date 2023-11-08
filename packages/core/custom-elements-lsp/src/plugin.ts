import {
  decorateWithTemplateLanguageService,
  Logger,
} from 'typescript-template-language-service-decorator';
import { CoreCompletionsServiceImpl, PartialCompletionsService } from './completions';
import { CEM_FIRST_LOADED_EVENT } from './constants/misc';
import {
  LiveUpdatingCEManifestRepository,
  mixinParserConfigDefaults,
} from './custom-elements/manifest/repository';
import { CustomElementsAnalyzerManifestParser } from './custom-elements/repository';
import { CustomElementsServiceImpl } from './custom-elements/service';
import { CustomElementsLanguageService } from './customelements';
import { CoreDiagnosticsServiceImpl } from './diagnostics';
import { PartialDiagnosticsService } from './diagnostics/diagnostics.types';
import { GlobalDataRepositoryImpl } from './global-data/repository';
import { GlobalDataServiceImpl } from './global-data/service';
import { CoreMetadataServiceImpl, PartialMetadataService } from './metadata';
import { CEPPluginRespistoryImpl } from './plugins/repository';
import { CEPPluginServiceImpl } from './plugins/service';
import { LanguageServiceLogger, IOServiceImpl, TypescriptCompilerIORepository } from './utils';
import { Services } from './utils/services.types';

const USE_BYPASS = false;

// TODO: Refactor this function it is a mess
export function init(modules: { typescript: typeof import('typescript/lib/tsserverlibrary') }) {
  console.log('INIT');
  const ts = modules.typescript;

  const proxy: ts.LanguageService = Object.create(null);

  // This just sets up a decorator proxy to bypass the plugin, to fix the LSP
  // if you break it
  function bypass(info: ts.server.PluginCreateInfo) {
    const logger = new LanguageServiceLogger(info, 'CE-BYPASS');
    logger.log('Setting up bypass proxy');

    for (const k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    return proxy;
  }

  if (USE_BYPASS) {
    return { create: bypass };
  }

  function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    const logger = new LanguageServiceLogger(info, 'CE');
    logger.log('Setting up main plugin');

    const services = initServices({
      logger,
      config: info.config,
      ts,
    });

    const pluginLoader = new CEPPluginServiceImpl(new CEPPluginRespistoryImpl(logger, services));
    const plugins = pluginLoader.loadPlugins(info.config.plugins || []);

    const completions: PartialCompletionsService[] = [
      new CoreCompletionsServiceImpl(logger, services),
    ];

    const diagnostics: PartialDiagnosticsService[] = [
      new CoreDiagnosticsServiceImpl(logger, services),
    ];

    const metadata: PartialMetadataService[] = [new CoreMetadataServiceImpl(logger, services)];

    plugins.then((loaders) =>
      loaders.forEach((plugin) => {
        completions.push(...(plugin.completions || []));
        diagnostics.push(...(plugin.diagnostics || []));
        metadata.push(...(plugin.metadata || []));
      }),
    );

    if (info.config.fastEnable) {
      logger.log('FAST config enabled');
    }

    return decorateWithTemplateLanguageService(
      ts,
      info.languageService,
      info.project,
      new CustomElementsLanguageService(
        logger,
        diagnostics,
        completions,
        metadata,
        services.servicesReady,
      ),
      {
        tags: ['html'], // Could add for css too
        enableForStringWithSubstitutions: true,
      },
    );
  }

  return { create };
}

function initServices({
  logger,
  config,
  ts,
}: {
  logger: Logger;
  config: any;
  ts: typeof import('typescript/lib/tsserverlibrary');
}): Services {
  let servicesReady = false;
  const projectRoot = config.srcRouteFromTSServer || '../../..';

  const ioRepo = new TypescriptCompilerIORepository(logger, ts.createCompilerHost({}), projectRoot);
  const io = new IOServiceImpl(ioRepo);

  const liveManifest = new LiveUpdatingCEManifestRepository(
    logger,
    io,
    mixinParserConfigDefaults(config.parser),
    config.fastEnable,
  );
  const cemRepository = new CustomElementsAnalyzerManifestParser(logger, liveManifest, {
    designSystemPrefix: config.designSystemPrefix,
  });
  cemRepository.once(CEM_FIRST_LOADED_EVENT, () => (servicesReady = true));
  const customElements = new CustomElementsServiceImpl(logger, cemRepository);

  const globalData = new GlobalDataServiceImpl(logger, new GlobalDataRepositoryImpl(logger));

  return { customElements, globalData, io, servicesReady: () => servicesReady };
}
