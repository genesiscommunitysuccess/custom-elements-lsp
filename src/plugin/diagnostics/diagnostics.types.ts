import { HTMLElement } from 'node-html-parser';
import { Diagnostic } from 'typescript/lib/tsserverlibrary';
import { TemplateContext } from 'typescript-template-language-service-decorator';

export type DiagnosticCtx = {
  context: TemplateContext;
  diagnostics: Diagnostic[];
  root: HTMLElement;
};

export interface DiagnosticsService {
  getSemanticDiagnostics(ctx: DiagnosticCtx): Diagnostic[];
}

export interface PartialDiagnosticsService extends Partial<DiagnosticsService> {}
