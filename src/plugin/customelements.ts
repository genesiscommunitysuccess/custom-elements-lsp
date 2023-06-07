import parse from 'node-html-parser';
import { CompletionInfo, LineAndCharacter } from 'typescript';
import { Diagnostic } from 'typescript/lib/tsserverlibrary';
import {
  TemplateContext,
  TemplateLanguageService,
} from 'typescript-template-language-service-decorator';
import { getCompletionType, PartialCompletionsService } from './completions';
import { LanguageServiceLogger } from './utils';
import { PartialDiagnosticsService } from './diagnostics/diagnostics.types';

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
