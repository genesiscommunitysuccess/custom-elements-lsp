import { Diagnostic, DiagnosticCategory, SourceFile } from 'typescript/lib/tsserverlibrary';
import { getCEServiceFromStubbedResource } from '../../jest/custom-elements';
import { getGDServiceFromStubbedResource } from '../../jest/global-data';
import { buildServices, getLogger } from '../../jest/utils';
import { DUPLICATE_ATTRIBUTE, UNKNOWN_ATTRIBUTE } from '../constants/diagnostic-codes';
import { CustomElementsService } from '../custom-elements/custom-elements.types';
import { GlobalDataRepository } from '../global-data/global-data.types';
import { FASTDiagnosticsService } from './fast';

const getFASTDiagnosticsService = (
  ce: CustomElementsService,
  gd: GlobalDataRepository = getGDServiceFromStubbedResource(),
) => new FASTDiagnosticsService(getLogger(), buildServices({ customElements: ce, globalData: gd }));

const file = 'test-file' as unknown as SourceFile;

describe('mapAndFilterValidAttributes', () => {
  it('returns null for a diagnostic which was for a valid boolean binding attribute', () => {
    const service = getFASTDiagnosticsService(getCEServiceFromStubbedResource());
    const validDiagnostic: Diagnostic = {
      length: 1,
      start: 1,
      category: 1,
      code: UNKNOWN_ATTRIBUTE,
      messageText: 'Unknown attribute "?activated" for custom element "custom-element"',
      file,
    };
    const res = (service as any).mapAndFilterValidAttributes(validDiagnostic);
    expect(res).toBe(null);
  });

  it('returns the input diagnostic for a diagnostic which was for an invalid boolean binding attribute', () => {
    const service = getFASTDiagnosticsService(getCEServiceFromStubbedResource());
    const input: Diagnostic = {
      length: 1,
      start: 1,
      category: 0,
      code: UNKNOWN_ATTRIBUTE,
      messageText: 'Unknown attribute "?activated" for custom element "no-attr"',
      file,
    };
    const res = (service as any).mapAndFilterValidAttributes(input);
    expect(res).toEqual({
      category: 0,
      code: 1001,
      file: 'test-file',
      length: 1,
      messageText: 'Unknown attribute "?activated" for custom element "no-attr"',
      start: 1,
    });
  });

  it('returns null for a diagnostic which was for a valid member binding attribute', () => {
    const service = getFASTDiagnosticsService(getCEServiceFromStubbedResource());
    const validDiagnostic: Diagnostic = {
      length: 1,
      start: 1,
      category: 1,
      code: UNKNOWN_ATTRIBUTE,
      messageText: 'Unknown attribute ":member" for custom element "custom-element"',
      file,
    };
    const res = (service as any).mapAndFilterValidAttributes(validDiagnostic);
    expect(res).toBe(null);
  });

  it('returns the input diagnostic for a diagnostic which was for an member binding attribute', () => {
    const service = getFASTDiagnosticsService(getCEServiceFromStubbedResource());
    const input: Diagnostic = {
      length: 1,
      start: 1,
      category: 0,
      code: UNKNOWN_ATTRIBUTE,
      messageText: 'Unknown attribute ":member" for custom element "no-attr"',
      file,
    };
    const res = (service as any).mapAndFilterValidAttributes(input);
    expect(res).toEqual({
      category: 0,
      code: 1001,
      file: 'test-file',
      length: 1,
      messageText: 'Unknown attribute ":member" for custom element "no-attr"',
      start: 1,
    });
  });

  it('returns input diagnostic for other attr code types', () => {
    const service = getFASTDiagnosticsService(getCEServiceFromStubbedResource());
    const input: Diagnostic = {
      length: 1,
      start: 1,
      category: 0,
      code: DUPLICATE_ATTRIBUTE,
      messageText: '',
      file,
    };
    const res = (service as any).mapAndFilterValidAttributes(input);
    expect(res).toEqual({
      category: 0,
      code: 1002,
      file: 'test-file',
      length: 1,
      messageText: '',
      start: 1,
    });
  });
});

describe('checkOrTransformEventAttribute', () => {
  it('returns null for any known event attribute', () => {
    const service = getFASTDiagnosticsService(getCEServiceFromStubbedResource());
    const validEventDiagnostic: Diagnostic = {
      start: 0,
      length: 2,
      file,
      category: DiagnosticCategory.Error,
      code: UNKNOWN_ATTRIBUTE,
      messageText: 'Unknown attribute "@event" for custom element "custom-element"',
    };
    const res = (service as any).checkOrTransformEventAttribute(
      validEventDiagnostic,
      'event',
      'custom-element',
    );
    expect(res).toBe(null);
  });

  it('returns null for any known (global) event attribute', () => {
    const service = getFASTDiagnosticsService(getCEServiceFromStubbedResource());
    const validEventDiagnostic: Diagnostic = {
      start: 0,
      length: 2,
      file,
      category: DiagnosticCategory.Error,
      code: UNKNOWN_ATTRIBUTE,
      messageText: 'Unknown attribute "@resize" for custom element "custom-element"',
    };
    const res = (service as any).checkOrTransformEventAttribute(
      validEventDiagnostic,
      'event',
      'custom-element',
    );
    expect(res).toBe(null);
  });

  it('returns the diagnostic transformed to a warning for an unknown event attribute', () => {
    const service = getFASTDiagnosticsService(getCEServiceFromStubbedResource());
    const invalidEventDiagnostic: Diagnostic = {
      start: 0,
      length: 2,
      file,
      category: DiagnosticCategory.Error,
      code: UNKNOWN_ATTRIBUTE,
      messageText: 'Unknown attribute "@unknown" for custom element "custom-element"',
    };
    const res = (service as any).checkOrTransformEventAttribute(
      invalidEventDiagnostic,
      'unknown',
      'custom-element',
    );
    expect(res).toEqual({
      category: 0,
      code: 1004,
      file: 'test-file',
      length: 2,
      messageText: 'Unknown event binding "@unknown" for custom element "custom-element"',
      start: 0,
    });
  });
});
