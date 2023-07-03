import {
  decorateWithTemplateLanguageService,
  Logger,
} from 'typescript-template-language-service-decorator';
import { CoreCompletionsServiceImpl, PartialCompletionsService } from './completions';
import { FASTCompletionsService } from './completions/fast';
import { CustomElementsAnalyzerManifestParser } from './custom-elements/repository';
import { CustomElementsServiceImpl } from './custom-elements/service';
import { CustomElementsLanguageService } from './customelements';
import { CoreDiagnosticsServiceImpl } from './diagnostics';
import { GlobalDataRepositoryImpl } from './global-data/repository';
import { PartialDiagnosticsService } from './diagnostics/diagnostics.types';
import { GlobalDataServiceImpl } from './global-data/service';
import { LanguageServiceLogger, IOServiceImpl, TypescriptCompilerIORepository } from './utils';
import { Services } from './utils/services.types';
import { FASTDiagnosticsService } from './diagnostics/fast';
import { CoreMetadataServiceImpl, PartialMetadataService } from './metadata';
import { FASTMetadataService } from './metadata/fast';
import {
  LiveUpdatingCEManifestRepository,
  mixinParserConfigDefaults,
  StaticCEManifestRepository,
} from './custom-elements/manifest/repository';

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

    const completions: PartialCompletionsService[] = [
      new CoreCompletionsServiceImpl(logger, services),
    ];

    const diagnostics: PartialDiagnosticsService[] = [
      new CoreDiagnosticsServiceImpl(logger, services),
    ];

    const metadata: PartialMetadataService[] = [new CoreMetadataServiceImpl(logger, services)];

    if (info.config.fastEnable) {
      logger.log('FAST config enabled');
      completions.push(new FASTCompletionsService(logger, services));
      diagnostics.push(new FASTDiagnosticsService(logger, services));
      metadata.push(new FASTMetadataService(logger, services));
    }

    return decorateWithTemplateLanguageService(
      ts,
      info.languageService,
      info.project,
      new CustomElementsLanguageService(logger, diagnostics, completions, metadata),
      {
        tags: ['html'], // Could add for css too
        enableForStringWithSubstitutions: true,
      }
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
  const projectRoot = config.srcRouteFromTSServer || '../../..';

  const ioRepo = new TypescriptCompilerIORepository(logger, ts.createCompilerHost({}), projectRoot);
  const io = new IOServiceImpl(ioRepo);

  const manifest = new StaticCEManifestRepository(logger, io);
  const liveManifest = new LiveUpdatingCEManifestRepository(
    logger,
    io,
    mixinParserConfigDefaults(config.parser)
  );
  const customElements = new CustomElementsServiceImpl(
    logger,
    new CustomElementsAnalyzerManifestParser(logger, manifest, {
      designSystemPrefix: config.designSystemPrefix,
    })
  );

  const globalData = new GlobalDataServiceImpl(logger, new GlobalDataRepositoryImpl(logger));

  return { customElements, globalData, io };
}
