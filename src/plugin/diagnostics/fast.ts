import { Logger } from 'typescript-template-language-service-decorator';
import { Diagnostic } from 'typescript/lib/tsserverlibrary';
import { UNKNOWN_ATTRIBUTE } from '../constants/diagnostic-codes';
import { Services } from '../utils/services.types';
import { DiagnosticCtx, PartialDiagnosticsService } from './diagnostics.types';

/**
 * If Microsoft FAST config is enabled then this service will provide
 * enhanced diagnostics for FAST templating syntax.
 *
 * @remarks This should be used in conjunction with the CoreDiagnosticsServiceImpl
 * or another class which fully implements the DiagnosticsService interface.
 *
 * @privateRemarks as a PartialDiagnosticsService this class is not required to
 * implement every method of the DiagnosticsService interface if not required
 * for FAST.
 */
export class FASTDiagnosticsService implements PartialDiagnosticsService {
  constructor(private logger: Logger, private services: Services) {
    this.logger.log('Setting up FAST Enhancement Diagnostics Service');
  }

  getSemanticDiagnostics(ctx: DiagnosticCtx): Diagnostic[] {
    const withoutValidAttributes = this.filterValidDiagnostics(ctx.diagnostics);
    return withoutValidAttributes;
  }

  private filterValidDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
    return diagnostics.filter((d) => {
      switch (d.code) {
        case UNKNOWN_ATTRIBUTE:
          return this.filterValidAttributes(d);
        default:
          return true;
      }
    });
  }

  private filterValidAttributes(d: Diagnostic): boolean {
    if (d.code !== UNKNOWN_ATTRIBUTE) {
      return true;
    }
    const msgRegex = /Unknown attribute "(.+)" for custom element "(.+)"/;
    const res = msgRegex.exec(d.messageText as string);
    if (!res) {
      this.logger.log(
        `filterValidAttributes: Failed to parse diagnostic message: ${JSON.stringify(
          d.messageText
        )}`
      );
      return true;
    }
    const [_, attrName, tagName] = res;
    const [prefix, attr] = [attrName.slice(0, 1), attrName.slice(1)];

    if (prefix === '?') {
      const isValidBooleanBinding = !(
        this.services.customElements
          .getCEAttributes(tagName)
          .filter(({ name, type }) => name === attr && type === 'boolean').length > 0
      );
      return isValidBooleanBinding;
    } else if (prefix === ':') {
      const isValidPropertyBinding = !(
        this.services.customElements.getCEMembers(tagName).filter(({ name }) => name === attr)
          .length > 0
      );
      return isValidPropertyBinding;
    }

    return true;
  }
}
