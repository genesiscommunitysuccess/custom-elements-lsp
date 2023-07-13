import { getLogger, html } from '../jest/utils';
import { PartialCompletionsService } from './completions';
import { CustomElementsLanguageService } from './customelements';
import { PartialDiagnosticsService } from './diagnostics/diagnostics.types';
import { PartialMetadataService } from './metadata';

type LanguageServiceConstructorParams = {
  diagnostics: PartialDiagnosticsService[];
  completions: PartialCompletionsService[];
  metadata: PartialMetadataService[];
  servicesReady: () => boolean;
};
const buildLanguageService = (overrides: Partial<LanguageServiceConstructorParams>) =>
  new CustomElementsLanguageService(
    getLogger(),
    overrides.diagnostics ?? [],
    overrides.completions ?? [],
    overrides.metadata ?? [],
    overrides.servicesReady ?? (() => true)
  );

const buildMockPartialServices = <T>(length: number = 2, fn: () => T): T[] =>
  Array.from({ length }).map(fn);

describe('getSemanticDiagnostics', () => {
  const getMockDiagnosticsServices = (count: number = 2) =>
    buildMockPartialServices(
      count,
      (): PartialDiagnosticsService => ({
        getSemanticDiagnostics: jest.fn(),
      })
    );

  it('returns an empty array if the services are not yet ready', () => {
    const mockDiagnostics = getMockDiagnosticsServices();
    const service = buildLanguageService({
      diagnostics: mockDiagnostics,
      servicesReady: () => false,
    });
    const context = html``;
    const res = service.getSemanticDiagnostics(context);
    expect(res).toEqual([]);
    expect(mockDiagnostics[0].getSemanticDiagnostics).not.toHaveBeenCalled();
    expect(mockDiagnostics[1].getSemanticDiagnostics).not.toHaveBeenCalled();
  });

  it('runs through all available getSemanticDiagnostics functions in the pipeline', () => {
    const mockDiagnostics: PartialDiagnosticsService[] = [{}].concat(getMockDiagnosticsServices());
    (mockDiagnostics[1].getSemanticDiagnostics as jest.Mock).mockReturnValueOnce(['hello']);
    (mockDiagnostics[2].getSemanticDiagnostics as jest.Mock).mockReturnValueOnce(['output']);
    const service = buildLanguageService({
      diagnostics: mockDiagnostics,
    });
    const context = html``;
    const res = service.getSemanticDiagnostics(context);
    expect(res).toEqual(['output']);
    // Can't use toHaveBeenCalledWith or calls[0][0] because calling with objects is causing errors in jest
    expect(
      (mockDiagnostics[1].getSemanticDiagnostics as jest.Mock).mock.calls[0][0].context
    ).toEqual(context);
    expect(
      (mockDiagnostics[1].getSemanticDiagnostics as jest.Mock).mock.calls[0][0].diagnostics
    ).toEqual([]);
    expect(
      (mockDiagnostics[2].getSemanticDiagnostics as jest.Mock).mock.calls[0][0].context
    ).toEqual(context);
    expect(
      (mockDiagnostics[2].getSemanticDiagnostics as jest.Mock).mock.calls[0][0].diagnostics
    ).toEqual(['hello']);
  });
});

describe('getCompletionsAtPosition', () => {
  const getMockCompletionsServices = (count: number = 2) =>
    buildMockPartialServices(
      count,
      (): PartialCompletionsService => ({
        getCompletionsAtPosition: jest.fn(),
      })
    );

  it('returns no completions if the services are not yet ready', () => {
    const mockCompletions = getMockCompletionsServices();
    const service = buildLanguageService({
      completions: mockCompletions,
      servicesReady: () => false,
    });
    const context = html``;
    const res = service.getCompletionsAtPosition(context, { line: 0, character: 1 });
    expect(res).toEqual({
      entries: [],
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
    });
    expect(mockCompletions[0].getCompletionsAtPosition).not.toHaveBeenCalled();
    expect(mockCompletions[1].getCompletionsAtPosition).not.toHaveBeenCalled();
  });

  it('runs through all available getCompletionsAtPosition functions in the pipeline', () => {
    const mockCompletions: PartialCompletionsService[] = [{}].concat(getMockCompletionsServices());
    (mockCompletions[1].getCompletionsAtPosition as jest.Mock).mockReturnValueOnce([
      'completion-1',
    ]);
    (mockCompletions[2].getCompletionsAtPosition as jest.Mock).mockReturnValueOnce([
      'completion-2',
    ]);
    const service = buildLanguageService({
      completions: mockCompletions,
    });
    const context = html``;
    const position = { line: 0, character: 1 };
    const res = service.getCompletionsAtPosition(context, position);
    expect(res).toEqual(['completion-2']);
    const baseCompletions = {
      entries: [],
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
    };
    expect(mockCompletions[1].getCompletionsAtPosition as jest.Mock).toHaveBeenCalledWith(
      baseCompletions,
      {
        context,
        position,
        typeAndParam: {
          key: 'none',
          param: undefined,
        },
      }
    );
    expect(mockCompletions[2].getCompletionsAtPosition as jest.Mock).toHaveBeenCalledWith(
      ['completion-1'],
      {
        context,
        position,
        typeAndParam: {
          key: 'none',
          param: undefined,
        },
      }
    );
  });
});

describe('getQuickInfoAsPosition', () => {
  const getMockMetadataServices = (count: number = 2) =>
    buildMockPartialServices(
      count,
      (): PartialMetadataService => ({
        getQuickInfoAtPosition: jest.fn(),
      })
    );

  it('returns undefined if the services are not yet ready', () => {
    const mockMetadataServices = getMockMetadataServices();
    const service = buildLanguageService({
      metadata: mockMetadataServices,
      servicesReady: () => false,
    });
    const context = html``;
    const position = { line: 0, character: 1 };
    const res = service.getQuickInfoAtPosition(context, position);
    expect(res).toBeUndefined();
    expect(mockMetadataServices[0].getQuickInfoAtPosition).not.toHaveBeenCalled();
    expect(mockMetadataServices[1].getQuickInfoAtPosition).not.toHaveBeenCalled();
  });

  it('returns undefined if the cursor is not on a valid word pattern', () => {
    const mockMetadataServices = getMockMetadataServices();
    const service = buildLanguageService({
      metadata: mockMetadataServices,
    });
    const context = html``;
    const position = { line: 0, character: 1 };
    const res = service.getQuickInfoAtPosition(context, position);
    expect(res).toBeUndefined();
    expect(mockMetadataServices[0].getQuickInfoAtPosition).not.toHaveBeenCalled();
    expect(mockMetadataServices[1].getQuickInfoAtPosition).not.toHaveBeenCalled();
  });

  it('returns undefined if the token under the cursor is TokenUnderCursorType => none', () => {
    const mockMetadataServices = getMockMetadataServices();
    const service = buildLanguageService({
      metadata: mockMetadataServices,
    });
    // Ensure this context def is on one line
    // eslint-disable-next-line
    const context = html`abcdfs`;
    const position = { line: 0, character: 3 };
    const res = service.getQuickInfoAtPosition(context, position);
    expect(res).toBeUndefined();
    expect(mockMetadataServices[0].getQuickInfoAtPosition).not.toHaveBeenCalled();
    expect(mockMetadataServices[1].getQuickInfoAtPosition).not.toHaveBeenCalled();
  });

  it('runs through all of the available getQuickInfoAtPosition functions in the pipeline', () => {
    const mockMetadataServices: PartialMetadataService[] = [{}].concat(getMockMetadataServices());
    (mockMetadataServices[1].getQuickInfoAtPosition as jest.Mock).mockReturnValueOnce([
      'metadata-1',
    ]);
    (mockMetadataServices[2].getQuickInfoAtPosition as jest.Mock).mockReturnValueOnce([
      'metadata-2',
    ]);
    const service = buildLanguageService({
      metadata: mockMetadataServices,
    });
    // Ensure this context def is on one line
    // eslint-disable-next-line
    const context = html`<custom-element></custom-element>`;
    const position = { line: 0, character: 3 };
    const res = service.getQuickInfoAtPosition(context, position);
    expect(res).toEqual(['metadata-2']);
    expect(mockMetadataServices[1].getQuickInfoAtPosition as jest.Mock).toHaveBeenCalledWith({
      context,
      position,
      result: undefined,
      token: 'custom-element',
      tokenSpan: {
        length: 14,
        start: 1,
      },
      typeAndParam: {
        key: 'tag-name',
        params: {
          isCustomElement: true,
        },
      },
    });
    expect(mockMetadataServices[2].getQuickInfoAtPosition as jest.Mock).toHaveBeenCalledWith({
      context,
      position,
      result: ['metadata-1'],
      token: 'custom-element',
      tokenSpan: {
        length: 14,
        start: 1,
      },
      typeAndParam: {
        key: 'tag-name',
        params: {
          isCustomElement: false,
        },
      },
    });
  });
});
