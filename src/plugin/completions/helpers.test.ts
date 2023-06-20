import { LineAndCharacter } from 'typescript/lib/tsserverlibrary';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import { html } from '../../jest/utils';
import {
  constructGlobalAriaCompletion,
  constructGlobalAttrCompletion,
  constructGlobalEventCompletion,
} from './helpers';
import { getTokenTypeWithInfo } from '../utils';

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
