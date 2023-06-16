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
import {
  LanguageServiceLogger,
  IOServiceImpl,
  IORepository,
  TypescriptCompilerIORepository,
} from './utils';
import { Services } from './utils/services.types';
import { FASTDiagnosticsService } from './diagnostics/fast';
import { CoreMetadataServiceImpl, PartialMetadataService } from './metadata';

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

  let useBypassDueToError = false;

  function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    const logger = new LanguageServiceLogger(info, 'CE');
    logger.log('Setting up main plugin');

    // TODO: Should this default or error out?
    const projectRoot = info.config.srcRouteFromTSServer || '../../..';

    const ioRepo = new TypescriptCompilerIORepository(
      logger,
      ts.createCompilerHost({}),
      projectRoot
    );

    // TODO: Need to use the service to get the schema FUI-1195
    const maybeSchema = ioRepo.readFile(ioRepo.getNormalisedRootPath() + 'ce.json');
    if (!maybeSchema) {
      console.error('Unable to read schema, using plugin bypass.');
      console.error(`Searched for schema at ${projectRoot}/ce.json`);
      useBypassDueToError = true;
      return proxy;
    }

    const schema = JSON.parse(maybeSchema);

    const services = initServices({
      logger,
      schema,
      ioRepo,
      config: info.config,
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

  return { create: useBypassDueToError ? bypass : create };
}

function initServices({
  logger,
  schema,
  ioRepo,
  config,
}: {
  logger: Logger;
  schema: any;
  ioRepo: IORepository;
  config: any;
}): Services {
  const customElements = new CustomElementsServiceImpl(
    logger,
    new CustomElementsAnalyzerManifestParser(logger, schema, {
      designSystemPrefix: config.designSystemPrefix,
    })
  );

  const globalData = new GlobalDataServiceImpl(logger, new GlobalDataRepositoryImpl(logger));

  const io = new IOServiceImpl(ioRepo);

  return { customElements, globalData, io };
}
