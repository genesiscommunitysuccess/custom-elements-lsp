import parse from 'node-html-parser';
import { CompletionInfo, LineAndCharacter } from 'typescript';
import { Diagnostic } from 'typescript/lib/tsserverlibrary';
import {
  TemplateContext,
  TemplateLanguageService,
} from 'typescript-template-language-service-decorator';
import { getCompletionType, PartialCompletionsService } from './completions';
import { DiagnosticsService } from './diagnostics';
import { LanguageServiceLogger } from './utils';

export class CustomElementsLanguageService implements TemplateLanguageService {
  constructor(
    private logger: LanguageServiceLogger,
    private diagnostics: DiagnosticsService,
    private completions: PartialCompletionsService[]
  ) {
    logger.log('Setting up customelements class');
  }

  getSyntacticDiagnostics(context: TemplateContext): Diagnostic[] {
    const sourceFile = context.node.getSourceFile();

    const diagnostics: Diagnostic[] = [];

    this.logger.log(`getSyntacticDiagnostics: ${sourceFile.fileName}`);
    const root = parse(context.text);
    this.logger.log(`getCompletionsAtPosition: root: ${root.toString()}`);

    const elementList = root.querySelectorAll('*');

    this.diagnostics
      .getUnknownCETag(context, elementList)
      .forEach((diag) => diagnostics.push(diag));

    this.diagnostics
      .getInvalidCEAttribute(context, elementList)
      .forEach((diag) => diagnostics.push(diag));

    return diagnostics;
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
