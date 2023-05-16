import { decorateWithTemplateLanguageService } from "typescript-template-language-service-decorator";
import { CompletionsService } from "./completions";
import { CustomElementsLanguageService } from "./customelements";
import { DiagnosticsService } from "./diagnostics";
import { CustomElementsAnalyzerManifestParser } from "./transformer/cem-analyzer-parser";
import { CustomElementsServiceImpl } from "./transformer/cem-transformer";
import { LanguageServiceLogger, TypescriptCompilerIOService } from "./utils";

const USE_BYPASS = false;

// TODO: Refactor this function it is a mess
export function init(modules: {
  typescript: typeof import("typescript/lib/tsserverlibrary");
}) {
  console.log("INIT");
  const ts = modules.typescript;

  const proxy: ts.LanguageService = Object.create(null);

  // This just sets up a decorator proxy to bypass the plugin, to fix the LSP
  // if you break it
  function bypass(info: ts.server.PluginCreateInfo) {
    const logger = new LanguageServiceLogger(info, "CE-BYPASS");
    logger.log("Setting up bypass proxy");

    for (let k of Object.keys(info.languageService) as Array<
      keyof ts.LanguageService
    >) {
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
    const logger = new LanguageServiceLogger(info, "CE");
    logger.log("Setting up main plugin");

    // TODO: Should this default or error out?
    const projectRoute = info.config.srcRouteFromTSServer || "../../..";

    const ioService = new TypescriptCompilerIOService(
      ts.createCompilerHost({}),
      projectRoute
    );

    const maybeSchema = ioService.readFile("ce.json");
    if (!maybeSchema) {
      console.error("Unable to read schema, using plugin bypass.");
      console.error(`Searched for schema at ${projectRoute}/ce.json`);
      useBypassDueToError = true;
      return proxy;
    }

    let schema = JSON.parse(maybeSchema);

    const customElementsResource = new CustomElementsServiceImpl(
      logger,
      new CustomElementsAnalyzerManifestParser(logger, schema, {
        designSystemPrefix: info.config.designSystemPrefix,
      })
    );

    return decorateWithTemplateLanguageService(
      ts,
      info.languageService,
      info.project,
      new CustomElementsLanguageService(
        logger,
        customElementsResource,
        new DiagnosticsService(logger, customElementsResource),
        new CompletionsService(logger, customElementsResource)
      ),
      {
        tags: ["html"], // Could add for css too
        enableForStringWithSubstitutions: true,
      }
    );
  }

  return { create: useBypassDueToError ? bypass : create };
}
