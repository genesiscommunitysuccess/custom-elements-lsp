import { LineAndCharacter } from 'typescript/lib/tsserverlibrary';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import { html } from '../../jest/utils';
import {
  constructGlobalAriaCompletion,
  constructGlobalAttrCompletion,
  constructGlobalEventCompletion,
  getCompletionType,
} from './helpers';

describe('getCompletionType', () => {
  const tests: [string, [TemplateContext, LineAndCharacter], any][] = [
    [
      'Key "none" for a blank template',
      [html``, { line: 0, character: 0 }],
      { key: 'none', params: undefined },
    ],
    [
      'Key "none" after a fully closed custom element',
      [
        html`
          <c-e></c-e>
        `,
        { line: 0, character: 11 },
      ],
      { key: 'none', params: undefined },
    ],
    [
      'Key "none" after a fully closed element',
      [
        html`
          <div></div>
        `,
        { line: 0, character: 11 },
      ],
      { key: 'none', params: undefined },
    ],
    [
      'Key "none" after a self closing element',
      [
        html`
          <input />
        `,
        { line: 0, character: 9 },
      ],
      { key: 'none', params: undefined },
    ],
    [
      'Key "none" after in invalid empty tag',
      [
        html`
          <>
        `,
        { line: 0, character: 2 },
      ],
      { key: 'none', params: undefined },
    ],
    [
      'Key "none" after an unclosed tag',
      [
        html`
          <div></div>
        `,
        { line: 0, character: 5 },
      ],
      { key: 'none', params: undefined },
    ],
    // custom-element-name
    [
      'Key "custom-element-name" after an opening tag',
      [
        html`
          <
        `,
        { line: 0, character: 1 },
      ],
      { key: 'custom-element-name', params: undefined },
    ],
    [
      'Key "custom-element-name" after an opening with characters',
      [html`<di`, { line: 0, character: 3 }],
      { key: 'custom-element-name', params: undefined },
    ],
    [
      'Key "custom-element-name" after an opening with characters, after a valid tag',
      [html`<div></div><di`, { line: 0, character: 14 }],
      { key: 'custom-element-name', params: undefined },
    ],
    // custom-element-attribute, with custom element name
    [
      'Key "custom-element-attribute" after the start of a custom element, and the name',
      [html`<cus-`, { line: 0, character: 5 }],
      { key: 'custom-element-attribute', params: 'cus-' },
    ],
    [
      'Key "custom-element-attribute" after a custom element, and the name',
      [html`<cus-elem`, { line: 0, character: 9 }],
      { key: 'custom-element-attribute', params: 'cus-elem' },
    ],
    [
      'Key "custom-element-attribute" after a custom element accounting for another custom element',
      [html`<ce-elem></ce-elem><cus-elem`, { line: 0, character: 28 }],
      { key: 'custom-element-attribute', params: 'cus-elem' },
    ],
    [
      'Key "custom-element-attribute" and gets custom element name when attribute is present',
      [html`<ce-elem></ce-elem><cus-elem attr`, { line: 0, character: 33 }],
      { key: 'custom-element-attribute', params: 'cus-elem' },
    ],
    [
      'Key "custom-element-attribute" and gets custom element name when string attribute is present',
      [html`<ce-elem></ce-elem><cus-elem attr="value"`, { line: 0, character: 41 }],
      { key: 'custom-element-attribute', params: 'cus-elem' },
    ],
    [
      'Key "custom-element-attribute" and gets custom element when curso is inside of a fully closed element',
      [
        html`
          <ce-elem></ce-elem>
          <cus-elem attr="value"></cus-elem>
        `,
        { line: 0, character: 41 },
      ],
      { key: 'custom-element-attribute', params: 'cus-elem' },
    ],
  ];

  for (const test of tests) {
    const [name, [context, lineAndChar], expected] = test;
    it(name, () => {
      // `getComptionType` is private so need to case to `any` to test it
      const result = getCompletionType(context, lineAndChar);
      expect(result).toEqual(expected);
    });
  }
});

describe('constructGlobalAriaCompletion', () => {
  it('returns CompletionEntry', () => {
    expect(constructGlobalAriaCompletion('test')).toEqual({
      insertText: 'test=""',
      kind: 'parameter',
      labelDetails: {
        description: '[attr] Aria',
      },
      name: 'test',
      sortText: 'z',
    });
  });
});

describe('constructGlobalEventCompletion', () => {
  it('returns CompletionEntry', () => {
    expect(constructGlobalEventCompletion('test')).toEqual({
      insertText: 'test=""',
      kind: 'parameter',
      labelDetails: {
        description: '[attr] Event',
        detail: ' event',
      },
      name: 'test',
      sortText: 'z',
    });
  });
});

describe('constructGlobalAttrCompletion', () => {
  it('returns CompletionEntry for type string', () => {
    expect(constructGlobalAttrCompletion('test', 'string')).toEqual({
      insertText: 'test=""',
      kind: 'parameter',
      labelDetails: {
        description: '[attr] Global',
        detail: ' string',
      },
      name: 'test',
      sortText: 'm',
    });
  });

  it('returns CompletionEntry for type boolean', () => {
    expect(constructGlobalAttrCompletion('test', 'boolean')).toEqual({
      insertText: 'test',
      kind: 'parameter',
      labelDetails: {
        description: '[attr] Global',
        detail: ' boolean',
      },
      name: 'test',
      sortText: 'm',
    });
  });

  it('returns CompletionEntry for type wildcard', () => {
    expect(constructGlobalAttrCompletion('test-*', 'wildcard')).toEqual({
      insertText: 'test-$1="${$2}"$0',
      isSnippet: true,
      kind: 'parameter',
      labelDetails: {
        description: '[attr] Global',
        detail: ' string',
      },
      name: 'test-*',
      sortText: 'm',
    });
  });
});
