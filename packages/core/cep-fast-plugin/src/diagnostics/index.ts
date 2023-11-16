import {
  CONSTANTS,
  utils,
  DiagnosticCtx,
  PartialDiagnosticsService,
  Services,
} from '@genesiscommunitysuccess/custom-elements-lsp/out/main/plugins/export-interface';
import { Diagnostic, DiagnosticCategory } from 'typescript/lib/tsserverlibrary';
import { Logger } from 'typescript-template-language-service-decorator';

const { stringHeadTail } = utils.strings;

/**
 * This service will provide
 * enhanced diagnostics for FAST templating syntax.
 *
 * @privateRemarks as a PartialDiagnosticsService this class is not required to
 * implement every method of the DiagnosticsService interface if not required
 * for FAST.
 */
export class FASTDiagnosticsService implements PartialDiagnosticsService {
  constructor(
    private logger: Logger,
    private services: Services,
  ) {
    this.logger.log('Setting up FAST Enhancement Diagnostics Service');
  }

  getSemanticDiagnostics(ctx: DiagnosticCtx): Diagnostic[] {
    const withoutValidAttributes = this.mapAndFilterValidDiagnostics(ctx.diagnostics);
    return withoutValidAttributes;
  }

  private mapAndFilterValidDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
    return diagnostics
      .map((d) => {
        switch (d.code) {
          case CONSTANTS.DIAGNOSTIC_CODES.UNKNOWN_ATTRIBUTE:
            return this.mapAndFilterValidAttributes(d);
          default:
            return d;
        }
      })
      .filter((d) => d !== null) as Diagnostic[];
  }

  private mapAndFilterValidAttributes(diag: Diagnostic): Diagnostic | null {
    if (diag.code !== CONSTANTS.DIAGNOSTIC_CODES.UNKNOWN_ATTRIBUTE) {
      return diag;
    }
    const msgRegex = /Unknown attribute "(.+)" for (?:custom )?element "(.+)"/;
    const res = msgRegex.exec(diag.messageText as string);
    if (!res) {
      this.logger.log(
        `filterValidAttributes: Failed to parse diagnostic message: ${JSON.stringify(
          diag.messageText,
        )}`,
      );
      return diag;
    }
    const [_, attrName, tagName] = res;
    const [prefix, attr] = stringHeadTail(attrName);

    if (prefix === '?') {
      const isValidBooleanBinding = this.services.customElements
        .getCEAttributes(tagName)
        .some(({ name, type }) => name === attr && type === 'boolean');
      return isValidBooleanBinding ? null : diag;
    } else if (prefix === ':') {
      const isValidPropertyBinding = this.services.customElements
        .getCEMembers(tagName)
        .some(({ name }) => name === attr);
      return isValidPropertyBinding ? null : diag;
    } else if (prefix === '@') {
      return this.checkOrTransformEventAttribute(diag, attr, tagName);
    }
    return diag;
  }

  private checkOrTransformEventAttribute(
    diag: Diagnostic,
    attr: string,
    tagName: string,
  ): Diagnostic | null {
    const totalEventsNameMap = utils
      .getStore(this.logger)
      .TSUnsafeGetOrAdd('total-events-names', () => {
        const totalEventsNames = this.services.customElements
          .getAllEvents()
          .map(({ name }) => name)
          .concat(this.services.globalData.getEvents().map((e) => e.replace('on', '')));
        return new Map(totalEventsNames.map((name) => [name, true]));
      });

    if (totalEventsNameMap.has(attr)) {
      return null;
    }

    return {
      ...diag,
      category: DiagnosticCategory.Warning,
      code: CONSTANTS.DIAGNOSTIC_CODES.UNKNOWN_EVENT,
      messageText: `Unknown event binding "@${attr}" for ${
        tagName.includes('-') ? 'custom ' : ''
      }element "${tagName}"`,
    };
  }
}
