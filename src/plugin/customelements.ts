import { CompletionInfo, LineAndCharacter } from "typescript";
import {
  TemplateContext,
  TemplateLanguageService,
} from "typescript-template-language-service-decorator";
import { Diagnostic } from "typescript/lib/tsserverlibrary";
import { LanguageServiceLogger } from "./utils";

import parse from "node-html-parser";
import { DiagnosticsService } from "./diagnostics";
import { CompletionsService } from "./completions";

export class CustomElementsLanguageService implements TemplateLanguageService {
  constructor(
    private logger: LanguageServiceLogger,
    private diagnostics: DiagnosticsService,
    private completions: CompletionsService
  ) {
    logger.log("Setting up customelements class");
  }

  getSyntacticDiagnostics(context: TemplateContext): Diagnostic[] {
    const sourceFile = context.node.getSourceFile();

    const diagnostics: Diagnostic[] = [];

    this.logger.log(`getSyntacticDiagnostics: ${sourceFile.fileName}`);
    const root = parse(context.text);
    this.logger.log(`getCompletionsAtPosition: root: ${root.toString()}`);

    const elementList = root.querySelectorAll("*");

    this.diagnostics
      .getUnknownCETag(context, elementList)
      .forEach((diag) => diagnostics.push(diag));

    this.diagnostics
      .getInvalidCEAttribute(context, elementList)
      .forEach((diag) => diagnostics.push(diag));

    return diagnostics;
  }

  getCompletionsAtPosition(
    context: TemplateContext,
    position: LineAndCharacter
  ): CompletionInfo {
    this.logger.log(`getCompletionsAtPosition: ${JSON.stringify(position)}`);
    return this.completions.getCompletionsAtPosition(context, position);
  }
}
