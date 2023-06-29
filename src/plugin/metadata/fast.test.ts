import { TextSpan } from 'typescript/lib/tsserverlibrary';
import { getCEServiceFromStubbedResource } from '../../jest/custom-elements';
import { getGDServiceFromStubbedResource } from '../../jest/global-data';
import { getIOServiceFromStubResource } from '../../jest/io';
import { buildServices, getLogger, html } from '../../jest/utils';
import { CustomElementsService } from '../custom-elements/custom-elements.types';
import { GlobalDataRepository } from '../global-data/global-data.types';
import { IOService } from '../utils';
import { FASTMetadataService } from './fast';

const getFastMetadataService = ({
  ce = getCEServiceFromStubbedResource(),
  gd = getGDServiceFromStubbedResource(),
  io = getIOServiceFromStubResource({}),
}: {
  ce?: CustomElementsService;
  gd?: GlobalDataRepository;
  io?: IOService;
}) =>
  new FASTMetadataService(getLogger(), buildServices({ customElements: ce, globalData: gd, io }));

describe('getQuickInfoAtPosition', () => {
  const tokenSpan: TextSpan = { start: 6, length: 14 };

  it('simply returns undefined for TokenUnderCursorType "none"', () => {
    const service = getFastMetadataService({});
    const quickFastAttrInfoSpy = jest.spyOn(service as any, 'quickInfoFASTAttribute');
    quickFastAttrInfoSpy.mockReturnValue(undefined);
    const res = service.getQuickInfoAtPosition({
      tokenSpan,
      typeAndParam: {
        key: 'none',
        params: undefined,
      },
      token: '',
      result: undefined,
      context: html``,
      position: { line: 0, character: 0 },
    });
    expect(res).toBeUndefined();
    expect(quickFastAttrInfoSpy).toHaveBeenCalledTimes(0);
  });

  it('returns the result of quickInfoFASTAttribute for a currently undefined result but for a known element', () => {
    const service = getFastMetadataService({});
    const quickFastAttrInfoSpy = jest.spyOn(service as any, 'quickInfoFASTAttribute');
    quickFastAttrInfoSpy.mockReturnValue('a');
    const res = service.getQuickInfoAtPosition({
      tokenSpan,
      typeAndParam: {
        key: 'custom-element-attribute',
        params: {
          tagName: 'custom-element',
        },
      },
      token: '',
      result: undefined,
      context: html``,
      position: { line: 0, character: 0 },
    });
    expect(res).toEqual('a');
    expect(quickFastAttrInfoSpy).toHaveBeenCalledTimes(1);
  });
});

describe('quickInfoFASTAttribute', () => {
  const tokenSpan: TextSpan = { start: 6, length: 14 };

  it('returns attribute binding quickinfo for a valid FAST boolean binding', () => {
    const service = getFastMetadataService({});
    const res = (service as any).quickInfoFASTAttribute(tokenSpan, '?activated', 'custom-element');
    expect(res).toEqual({
      displayParts: [
        {
          kind: 'text',
          text: '(attribute-binding) ?activated [CustomElement]',
        },
        {
          kind: 'text',
          text: '\n`boolean` (deprecated)',
        },
      ],
      documentation: [],
      kind: 'parameter',
      kindModifiers: 'declare',
      textSpan: tokenSpan,
    });
  });

  it('returns attribute binding quickinfo for a valid FAST event binding', () => {
    const service = getFastMetadataService({});
    const res = (service as any).quickInfoFASTAttribute(tokenSpan, '@inherited', 'no-attr');
    expect(res).toEqual({
      displayParts: [
        {
          kind: 'text',
          text: '(event-binding) @inherited [ParentElement]',
        },
        {
          kind: 'text',
          text: '\n`MouseEvent`',
        },
      ],
      documentation: [],
      kind: 'parameter',
      kindModifiers: 'declare',
      textSpan: {
        length: 14,
        start: 6,
      },
    });
  });

  it('returns attribute binding quickinfo for a valid FAST property binding', () => {
    const service = getFastMetadataService({});
    const res = (service as any).quickInfoFASTAttribute(tokenSpan, ':member', 'custom-element');
    expect(res).toEqual({
      displayParts: [
        {
          kind: 'text',
          text: '(property-binding) :member [ParentElement]',
        },
        {
          kind: 'text',
          text: '\n`string` (deprecated)',
        },
      ],
      documentation: [],
      kind: 'parameter',
      kindModifiers: 'declare',
      textSpan: {
        length: 14,
        start: 6,
      },
    });
  });

  it('returns undefined for an unknown FAST binding', () => {
    const service = getFastMetadataService({});
    const res = (service as any).quickInfoFASTAttribute(tokenSpan, ':member', 'no-attr');
    expect(res).toBeUndefined();
  });
});
