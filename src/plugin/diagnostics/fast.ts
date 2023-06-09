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
    const withoutValidBooleanBindings = this.filterBooleanBindingAttributes(ctx.diagnostics);
    return withoutValidBooleanBindings;
  }

  private filterBooleanBindingAttributes(diagnostics: Diagnostic[]): Diagnostic[] {
    return diagnostics.filter((d) => {
      if (d.code !== UNKNOWN_ATTRIBUTE) {
        return true;
      }
      const msgRegex = /Unknown attribute "(.+)" for custom element "(.+)"/;
      const res = msgRegex.exec(d.messageText as string);
      if (!res) {
        this.logger.log(
          `filterBooleanBindingAttributes: Failed to parse diagnostic message: ${JSON.stringify(
            d.messageText
          )}`
        );
        return true;
      }
      const [_, attrName, tagName] = res;
      if (!attrName.startsWith('?')) {
        return true;
      }
      const booleanBindingName = attrName.slice(1);

      const isValidBinding = !(
        this.services.customElements
          .getCEAttributes(tagName)
          .filter(({ name, type }) => name === booleanBindingName && type === 'boolean').length > 0
      );

      return isValidBinding;
    });
  }
}
