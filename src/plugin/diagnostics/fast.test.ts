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

describe('filterBooleanBindingAttributes', () => {
  const file = 'test-file' as unknown as SourceFile;
  const validDiagnostic: Diagnostic = {
    length: 1,
    start: 1,
    category: 1,
    code: UNKNOWN_ATTRIBUTE,
    messageText: 'Unknown attribute "?activated" for custom element "custom-element"',
    file,
  };
  it('returns an empty array if provided an empty array', () => {
    const service = getFASTDiagnosticsService(getCEServiceFromStubbedResource());
    const res = (service as any).filterBooleanBindingAttributes([]);
    expect(res.length).toBe(0);
  });

  it('filters out a valid boolean binding attribute for a custom element', () => {
    const service = getFASTDiagnosticsService(getCEServiceFromStubbedResource());
    const input: Diagnostic[] = [validDiagnostic];
    const res = (service as any).filterBooleanBindingAttributes(input);
    expect(res.length).toBe(0);
  });

  it('returns other errors wile filtering out a valid boolean binding', () => {
    const service = getFASTDiagnosticsService(getCEServiceFromStubbedResource());
    const input: Diagnostic[] = [
      validDiagnostic,
      {
        length: 1,
        start: 1,
        category: 0,
        code: DUPLICATE_ATTRIBUTE,
        messageText: '',
        file,
      },
      {
        ...validDiagnostic,
        messageText: 'Unknown attribute "?activated" for custom element "no-attr"',
      },
    ];
    const res = (service as any).filterBooleanBindingAttributes(input);
    expect(res).toEqual([
      {
        category: 0,
        code: 1002,
        file: 'test-file',
        length: 1,
        messageText: '',
        start: 1,
      },
      {
        category: 1,
        code: 1001,
        file: 'test-file',
        length: 1,
        messageText: 'Unknown attribute "?activated" for custom element "no-attr"',
        start: 1,
      },
    ]);
  });
});
