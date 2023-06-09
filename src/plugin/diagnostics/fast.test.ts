import { Diagnostic, SourceFile } from 'typescript/lib/tsserverlibrary';
import { getCEServiceFromStubbedResource } from '../../jest/custom-elements';
import { getGDServiceFromStubbedResource } from '../../jest/global-data';
import { buildServices, getLogger } from '../../jest/utils';
import { DUPLICATE_ATTRIBUTE, UNKNOWN_ATTRIBUTE } from '../constants/diagnostic-codes';
import { CustomElementsService } from '../custom-elements/custom-elements.types';
import { GlobalDataRepository } from '../global-data/global-data.types';
import { FASTDiagnosticsService } from './fast';

const getFASTDiagnosticsService = (
  ce: CustomElementsService,
  gd: GlobalDataRepository = getGDServiceFromStubbedResource()
) => new FASTDiagnosticsService(getLogger(), buildServices({ customElements: ce, globalData: gd }));

describe('filterValidAttributes', () => {
  const file = 'test-file' as unknown as SourceFile;

  it('returns true for a diagnostic which was for a valid boolean binding attribute', () => {
    const service = getFASTDiagnosticsService(getCEServiceFromStubbedResource());
    const validDiagnostic: Diagnostic = {
      length: 1,
      start: 1,
      category: 1,
      code: UNKNOWN_ATTRIBUTE,
      messageText: 'Unknown attribute "?activated" for custom element "custom-element"',
      file,
    };
    const res = (service as any).filterValidAttributes(validDiagnostic);
    expect(res).toBe(false);
  });

  it('returns false for a diagnostic which was for an invalid boolean binding attribute', () => {
    const service = getFASTDiagnosticsService(getCEServiceFromStubbedResource());
    const input: Diagnostic = {
      length: 1,
      start: 1,
      category: 0,
      code: UNKNOWN_ATTRIBUTE,
      messageText: 'Unknown attribute "?activated" for custom element "no-attr"',
      file,
    };
    const res = (service as any).filterValidAttributes(input);
    expect(res).toEqual(true);
  });

  it('returns false for other attr code types', () => {
    const service = getFASTDiagnosticsService(getCEServiceFromStubbedResource());
    const input: Diagnostic = {
      length: 1,
      start: 1,
      category: 0,
      code: DUPLICATE_ATTRIBUTE,
      messageText: '',
      file,
    };
    const res = (service as any).filterValidAttributes(input);
    expect(res).toEqual(true);
  });
});
