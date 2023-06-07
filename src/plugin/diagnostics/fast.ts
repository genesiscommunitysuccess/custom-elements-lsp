import { Logger } from 'typescript-template-language-service-decorator';
import { Diagnostic } from 'typescript/lib/tsserverlibrary';
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
    // TODO: this is just a pass through for now
    return ctx.diagnostics;
  }
}
