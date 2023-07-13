import parse from 'node-html-parser';
import {
  CompletionInfo,
  DefinitionInfoAndBoundSpan,
  Diagnostic,
  LineAndCharacter,
  QuickInfo,
} from 'typescript/lib/tsserverlibrary';
import {
  Logger,
  TemplateContext,
  TemplateLanguageService,
} from 'typescript-template-language-service-decorator';
import { PartialCompletionsService } from './completions';
import { PartialDiagnosticsService } from './diagnostics/diagnostics.types';
import { getTokenTypeWithInfo, getTokenSpanMatchingPattern } from './utils';
import { PartialMetadataService } from './metadata';

/**
 * Handles calls from the TypeScript language server and delegates them to
 * arrays of services assigned during initialization.
 *
 * @remarks For every method this class implements from TemplateLanguageService
 * it will be called from the LSP at the appropriate time and pass back required
 * information that the LSP client then can use to interact with the user.
 *
 * We decouple logic for different custom element dialects such as Microsoft FAST
 * into their own classes, this class will run the API calls through all of the
 * passed classes as a pipeline where appropriate.
 */
export class CustomElementsLanguageService implements TemplateLanguageService {
  constructor(
    private logger: Logger,
    private diagnostics: PartialDiagnosticsService[],
    private completions: PartialCompletionsService[],
    private metadata: PartialMetadataService[],
    private servicesReady: () => boolean
  ) {
    logger.log('Setting up customelements class');
  }

  getSemanticDiagnostics(context: TemplateContext): Diagnostic[] {
    if (!this.servicesReady()) {
      return [];
    }
    const sourceFile = context.node.getSourceFile();
    this.logger.log(`getSyntacticDiagnostics: ${sourceFile.fileName}`);

    const diagnostics: Diagnostic[] = [];
    const root = parse(context.text);

    return this.diagnostics.reduce(
      (acum: Diagnostic[], service) =>
        service.getSemanticDiagnostics
          ? service.getSemanticDiagnostics({ context, diagnostics: acum, root })
          : acum,
      diagnostics
    );
  }

  getCompletionsAtPosition(context: TemplateContext, position: LineAndCharacter): CompletionInfo {
    const baseCompletionInfo: CompletionInfo = {
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries: [],
    };
    if (!this.servicesReady()) {
      return baseCompletionInfo;
    }

    this.logger.log(`getCompletionsAtPosition: ${JSON.stringify(position)}`);
    const typeAndParam = getTokenTypeWithInfo(context, position);
    this.logger.log(
      `getCompletionsAtPosition: ${typeAndParam.key}, ${JSON.stringify(typeAndParam.params)}`
    );

    return this.completions.reduce(
      (acum: CompletionInfo, service) =>
        service.getCompletionsAtPosition
          ? service.getCompletionsAtPosition(acum, {
              context,
              position,
              typeAndParam,
            })
          : acum,
      baseCompletionInfo
    );
  }

  getDefinitionAndBoundSpan(
    context: TemplateContext,
    position: LineAndCharacter
  ): DefinitionInfoAndBoundSpan {
    if (!this.servicesReady()) {
      return {
        textSpan: { start: 0, length: 0 },
      };
    }
    // TODO: Need to refactor this if we want to allow other classes to implement this method
    // in future
    const base = this.metadata[0];
    return base.getDefinitionAndBoundSpan!(context, position);
  }

  getQuickInfoAtPosition(
    context: TemplateContext,
    position: LineAndCharacter
  ): QuickInfo | undefined {
    if (!this.servicesReady()) {
      return undefined;
    }

    const maybeTokenSpan = getTokenSpanMatchingPattern(position, context, /[\w-:?@]/);
    if (!maybeTokenSpan) {
      return undefined;
    }

    const tokenEndPosition: LineAndCharacter = context.toPosition(
      maybeTokenSpan.start + maybeTokenSpan.length
    );

    const tokenTypeWithInfo = getTokenTypeWithInfo(context, tokenEndPosition);
    if (tokenTypeWithInfo.key === 'none') {
      return undefined;
    }

    const { start, length } = maybeTokenSpan;
    const token = context.rawText.slice(start, start + length);

    this.logger.log(`getQuickInfoAtPosition: ${token}`);

    return this.metadata.reduce(
      (acum: QuickInfo | undefined, service) =>
        service.getQuickInfoAtPosition
          ? service.getQuickInfoAtPosition({
              context,
              position,
              token,
              tokenSpan: maybeTokenSpan,
              result: acum,
              typeAndParam: tokenTypeWithInfo,
            })
          : acum,
      undefined
    );
  }
}
