import parse from 'node-html-parser';
import { CompletionInfo, Diagnostic, LineAndCharacter } from 'typescript/lib/tsserverlibrary';
import {
  TemplateContext,
  TemplateLanguageService,
} from 'typescript-template-language-service-decorator';
import { getCompletionType, PartialCompletionsService } from './completions';
import { PartialDiagnosticsService } from './diagnostics/diagnostics.types';
import { LanguageServiceLogger } from './utils';

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
    private logger: LanguageServiceLogger,
    private diagnostics: PartialDiagnosticsService[],
    private completions: PartialCompletionsService[]
  ) {
    logger.log('Setting up customelements class');
  }

  getSemanticDiagnostics(context: TemplateContext): Diagnostic[] {
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
    this.logger.log(`getCompletionsAtPosition: ${JSON.stringify(position)}`);
    const typeAndParam = getCompletionType(context, position);
    this.logger.log(`getCompletionsAtPosition: ${typeAndParam.key}, ${typeAndParam.params}`);

    return this.completions.reduce(
      (acum: CompletionInfo, service) =>
        service.getCompletionsAtPosition
          ? service.getCompletionsAtPosition(acum, {
              context,
              position,
              typeAndParam,
            })
          : acum,
      {
        isGlobalCompletion: false,
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
        entries: [],
      }
    );
  }
}
