import {
  CompletionEntry,
  CompletionInfo,
  ScriptElementKind,
  TextSpan,
} from 'typescript/lib/tsserverlibrary';
import { getCEServiceFromStubbedResource } from '../../jest/custom-elements';
import { getGDServiceFromStubbedResource } from '../../jest/global-data';
import { buildServices, getLogger, html } from '../../jest/utils';
import { CustomElementsService } from '../custom-elements/custom-elements.types';
import { GlobalDataService } from '../global-data/global-data.types';
import { CompletionCtx } from './completions.types';
import { FASTCompletionsService } from './fast';

const getFASTCompletionsService = (
  ceRes: CustomElementsService = getCEServiceFromStubbedResource(),
  gdRes: GlobalDataService = getGDServiceFromStubbedResource()
) =>
  new FASTCompletionsService(
    getLogger(),
    buildServices({ customElements: ceRes, globalData: gdRes })
  );

describe('convertFastEventAttributes', () => {
  const baseEntries: CompletionEntry[] = [
    {
      name: 'test',
      kind: ScriptElementKind.unknown,
      sortText: '',
    },
    {
      name: 'test-again',
      kind: ScriptElementKind.unknown,
      sortText: '',
    },
  ];

  it("Doesn't change any non labelDetails detail event completions", () => {
    const entries: CompletionEntry[] = [...baseEntries];
    const replacementSpan: TextSpan = { start: 0, length: 2 };

    const service = getFASTCompletionsService();
    const res = (service as any).convertFastEventAttributes(entries, replacementSpan);
    expect(res).toEqual(entries);
  });

  it('Changes only labelDetails detail events completions to the FAST binding snippet', () => {
    const entries: CompletionEntry[] = [
      ...baseEntries,
      {
        name: 'onclick',
        insertText: 'onclick=""',
        kind: ScriptElementKind.unknown,
        sortText: '',
        labelDetails: {
          detail: ' event',
        },
      },
    ];
    const replacementSpan: TextSpan = { start: 0, length: 2 };

    const service = getFASTCompletionsService();
    const res = (service as any).convertFastEventAttributes(entries, replacementSpan);
    expect(res).toEqual([
      ...baseEntries,
      {
        insertText: '@click="${(x,c) => $1}"$0',
        isSnippet: true,
        kind: '',
        name: '@click',
        replacementSpan: {
          length: 2,
          start: 0,
        },
        sortText: '',
        labelDetails: {
          detail: ' event',
        },
      },
    ]);
  });

  it('Updates the insert text to a snippet if set as inserting empty quotes', () => {
    const entries: CompletionEntry[] = [
      ...baseEntries,
      {
        name: 'onclick',
        insertText: 'onclick=""',
        kind: ScriptElementKind.unknown,
        sortText: '',
        labelDetails: {
          detail: ' event',
        },
      },
    ];
    const replacementSpan: TextSpan = { start: 0, length: 2 };

    const service = getFASTCompletionsService();
    const res = (service as any).convertFastEventAttributes(entries, replacementSpan);
    expect(res).toEqual([
      ...baseEntries,
      {
        insertText: '@click="${(x,c) => $1}"$0',
        isSnippet: true,
        kind: '',
        name: '@click',
        replacementSpan: {
          length: 2,
          start: 0,
        },
        labelDetails: {
          detail: ' event',
        },
        sortText: '',
      },
    ]);
  });
});

describe('addElementEventCompletions', () => {
  it("Doesn't return any completions if the custom element doesn't have any events", () => {
    const service = getFASTCompletionsService();
    const replacementSpan: TextSpan = { start: 0, length: 2 };
    const res = (service as any).addElementEventCompletions([], replacementSpan, 'no-attr');
    expect(res.length).toBe(0);
  });

  it("Doesn't return any completions if the custom element doesn't have any events", () => {
    const service = getFASTCompletionsService();
    const replacementSpan: TextSpan = { start: 0, length: 2 };
    const res = (service as any).addElementEventCompletions([], replacementSpan, 'custom-element');
    expect(res).toEqual([
      {
        insertText: '@event="${(x, c) => $1}"$0',
        isSnippet: true,
        kind: 'parameter',
        labelDetails: {
          description: '[attr] CustomElement',
        },
        name: '@event',
        replacementSpan: {
          length: 2,
          start: 0,
        },
        sortText: 'f',
      },
      {
        insertText: '@inherited="${(x, c) => $1}"$0',
        isSnippet: true,
        kind: 'parameter',
        labelDetails: {
          description: '[attr] ParentElement',
        },
        name: '@inherited',
        replacementSpan: {
          length: 2,
          start: 0,
        },
        sortText: 'f',
      },
    ]);
  });
});

describe('addDynamicBooleanBindings', () => {
  const baseEntries: CompletionEntry[] = [
    {
      name: 'test',
      kind: ScriptElementKind.unknown,
      sortText: '',
    },
  ];

  it('Does not add any fast snippets if no existing completions are booleans', () => {
    const service = getFASTCompletionsService();
    const replacementSpan: TextSpan = { start: 0, length: 2 };
    const res = (service as any).addDynamicBooleanBindings([...baseEntries], replacementSpan);
    expect(res).toEqual(baseEntries);
  });

  it('Adds a fast syntax dynamic binding for a boolean entry', () => {
    const service = getFASTCompletionsService();
    const replacementSpan: TextSpan = { start: 0, length: 2 };
    const booleanEntry: CompletionEntry = {
      name: 'boolean-attr',
      kind: ScriptElementKind.unknown,
      sortText: '',
      labelDetails: {
        detail: 'boolean',
      },
    };

    const res = (service as any).addDynamicBooleanBindings(
      [...baseEntries, booleanEntry],
      replacementSpan
    );

    expect(res).toEqual([
      ...baseEntries,
      booleanEntry,
      {
        insertText: '?boolean-attr="${(x) => $1}"$0',
        isSnippet: true,
        kind: '',
        labelDetails: {
          detail: ' boolean binding',
        },
        name: '?boolean-attr',
        replacementSpan: {
          length: 2,
          start: 0,
        },
        sortText: '',
      },
    ]);
  });
});

describe('getUpdatedAttributeEntries', () => {
  it('Returns the CompletionEntry with updated events to match fast and element events and boolean bindings added', () => {
    const service = getFASTCompletionsService();

    const position = { line: 0, character: 2 };
    const context = html`<custom-elem hi=`;
    const tagName = 'custom-element';
    const baseEntries: CompletionEntry[] = [
      {
        name: 'onclick',
        insertText: 'onclick=""',
        kind: ScriptElementKind.unknown,
        sortText: '',
        labelDetails: {
          detail: ' event',
        },
      },
      {
        name: 'boolean-attr',
        kind: ScriptElementKind.unknown,
        sortText: '',
        labelDetails: {
          detail: 'boolean',
        },
      },
    ];

    const res = (service as any).getUpdatedAttributeEntries(
      baseEntries,
      position,
      context,
      tagName
    );

    expect(res).toEqual([
      {
        insertText: '@click="${(x,c) => $1}"$0',
        isSnippet: true,
        kind: '',
        name: '@click',
        replacementSpan: {
          length: 2,
          start: 0,
        },
        labelDetails: {
          detail: ' event',
        },
        sortText: '',
      },
      {
        kind: '',
        labelDetails: {
          detail: 'boolean',
        },
        name: 'boolean-attr',
        sortText: '',
      },
      {
        insertText: '?boolean-attr="${(x) => $1}"$0',
        isSnippet: true,
        kind: '',
        labelDetails: {
          detail: ' boolean binding',
        },
        name: '?boolean-attr',
        replacementSpan: {
          length: 2,
          start: 0,
        },
        sortText: '',
      },
      {
        insertText: '@event="${(x, c) => $1}"$0',
        isSnippet: true,
        kind: 'parameter',
        labelDetails: {
          description: '[attr] CustomElement',
        },
        name: '@event',
        replacementSpan: {
          length: 2,
          start: 0,
        },
        sortText: 'f',
      },
      {
        insertText: '@inherited="${(x, c) => $1}"$0',
        isSnippet: true,
        kind: 'parameter',
        labelDetails: {
          description: '[attr] ParentElement',
        },
        name: '@inherited',
        replacementSpan: {
          length: 2,
          start: 0,
        },
        sortText: 'f',
      },
    ]);
  });
});

describe('getCompletionsAtPosition', () => {
  const baseCompletionInfo: CompletionInfo = {
    entries: [],
    isGlobalCompletion: false,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
  };

  it('Returns the CompletionInfo unaltered if the completion context is not attribute', () => {
    const service = getFASTCompletionsService();
    const ctx: CompletionCtx = {
      position: { line: 0, character: 0 },
      context: html``,
      typeAndParam: { key: 'none', params: undefined },
    };

    const spy = jest.spyOn(service as any, 'getUpdatedAttributeEntries');

    const res = service.getCompletionsAtPosition(baseCompletionInfo, ctx);
    expect(res).toEqual(baseCompletionInfo);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('Alters the entries via getUpdatedAttributeEntries if the completion context is attribute', () => {
    const service = getFASTCompletionsService();
    const ctx: CompletionCtx = {
      position: { line: 0, character: 0 },
      context: html``,
      typeAndParam: {
        key: 'custom-element-attribute',
        params: 'custom-element',
      },
    };

    const spy = jest.spyOn(service as any, 'getUpdatedAttributeEntries');
    spy.mockReturnValue(['test']);

    const res = service.getCompletionsAtPosition(baseCompletionInfo, ctx);
    expect(res).toEqual({
      ...baseCompletionInfo,
      entries: ['test'],
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
