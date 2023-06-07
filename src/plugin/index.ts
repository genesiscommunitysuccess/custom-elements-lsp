import {
  decorateWithTemplateLanguageService,
  Logger,
} from 'typescript-template-language-service-decorator';
import { CoreCompletionsServiceImpl, PartialCompletionsService } from './completions';
import { FASTCompletionsService } from './completions/fast';
import { CustomElementsAnalyzerManifestParser } from './custom-elements/repository';
import { CustomElementsServiceImpl } from './custom-elements/service';
import { CustomElementsLanguageService } from './customelements';
import { DiagnosticsService } from './diagnostics';
import { GlobalDataRepositoryImpl } from './global-data/repository';
import { GlobalDataServiceImpl } from './global-data/service';
import { LanguageServiceLogger, TypescriptCompilerIOService } from './utils';
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

  let useBypassDueToError = false;

  function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    const logger = new LanguageServiceLogger(info, 'CE');
    logger.log('Setting up main plugin');

    // TODO: Should this default or error out?
    const projectRoute = info.config.srcRouteFromTSServer || '../../..';

    const ioService = new TypescriptCompilerIOService(ts.createCompilerHost({}), projectRoute);

    const maybeSchema = ioService.readFile('ce.json');
    if (!maybeSchema) {
      console.error('Unable to read schema, using plugin bypass.');
      console.error(`Searched for schema at ${projectRoute}/ce.json`);
      useBypassDueToError = true;
      return proxy;
    }

    const schema = JSON.parse(maybeSchema);

    const services = initServices({
      logger,
      schema,
      config: info.config,
    });

    const completions: PartialCompletionsService[] = [
      new CoreCompletionsServiceImpl(logger, services),
    ];

    if (info.config.fastEnable) {
      logger.log('FAST config enabled');
      completions.push(new FASTCompletionsService(logger, services));
    }

    return decorateWithTemplateLanguageService(
      ts,
      info.languageService,
      info.project,
      new CustomElementsLanguageService(
        logger,
        new DiagnosticsService(logger, services),
        completions
      ),
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
  config,
}: {
  logger: Logger;
  schema: any;
  config: any;
}): Services {
  const customElements = new CustomElementsServiceImpl(
    logger,
    new CustomElementsAnalyzerManifestParser(logger, schema, {
      designSystemPrefix: config.designSystemPrefix,
    })
  );

  const globalData = new GlobalDataServiceImpl(logger, new GlobalDataRepositoryImpl(logger));

  return { customElements, globalData };
}
