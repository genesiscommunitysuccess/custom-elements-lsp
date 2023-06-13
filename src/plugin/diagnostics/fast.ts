import { Logger } from 'typescript-template-language-service-decorator';
import { Diagnostic, DiagnosticCategory } from 'typescript/lib/tsserverlibrary';
import { UNKNOWN_ATTRIBUTE, UNKNOWN_EVENT } from '../constants/diagnostic-codes';
import { getStore } from '../utils/kvstore';
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
    const withoutValidAttributes = this.mapAndFilterValidDiagnostics(ctx.diagnostics);
    return withoutValidAttributes;
  }

  private mapAndFilterValidDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
    return diagnostics
      .map((d) => {
        switch (d.code) {
          case UNKNOWN_ATTRIBUTE:
            return this.mapAndFilterValidAttributes(d);
          default:
            return d;
        }
      })
      .filter((d) => d !== null) as Diagnostic[];
  }

  private mapAndFilterValidAttributes(d: Diagnostic): Diagnostic | null {
    if (d.code !== UNKNOWN_ATTRIBUTE) {
      return d;
    }
    const msgRegex = /Unknown attribute "(.+)" for custom element "(.+)"/;
    const res = msgRegex.exec(d.messageText as string);
    if (!res) {
      this.logger.log(
        `filterValidAttributes: Failed to parse diagnostic message: ${JSON.stringify(
          d.messageText
        )}`
      );
      return d;
    }
    const [_, attrName, tagName] = res;
    const [prefix, attr] = [attrName.slice(0, 1), attrName.slice(1)];

    if (prefix === '?') {
      const isValidBooleanBinding = this.services.customElements
        .getCEAttributes(tagName)
        .some(({ name, type }) => name === attr && type === 'boolean');
      return isValidBooleanBinding ? null : d;
    } else if (prefix === ':') {
      const isValidPropertyBinding = this.services.customElements
        .getCEMembers(tagName)
        .some(({ name }) => name === attr);
      return isValidPropertyBinding ? null : d;
    } else if (prefix === '@') {
      return this.checkOrTransformEventAttribute(d, attr, tagName);
    }
    return d;
  }

  private checkOrTransformEventAttribute(
    d: Diagnostic,
    attr: string,
    tagName: string
  ): Diagnostic | null {
    const totalEventsNameMap = getStore(this.logger).TSUnsafeGetOrAdd('total-events-names', () => {
      const totalEventsNames = this.services.customElements
        .getAllEvents()
        .map(({ name }) => name)
        .concat(this.services.globalData.getEvents());
      return new Map(totalEventsNames.map((name) => [name, true]));
    });

    if (totalEventsNameMap.has(attr)) {
      return null;
    }

    return {
      ...d,
      category: DiagnosticCategory.Warning,
      code: UNKNOWN_EVENT,
      messageText: `Unknown event binding "@${attr}" for custom element "${tagName}"`,
    };
  }
}
