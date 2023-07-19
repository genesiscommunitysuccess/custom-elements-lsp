import { LineAndCharacter } from 'typescript/lib/tsserverlibrary';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import { html } from '../../jest/utils';
import {
  constructElementAttrCompletion,
  constructGlobalAriaCompletion,
  constructGlobalAttrCompletion,
  constructGlobalEventCompletion,
} from './helpers';
import { getTokenTypeWithInfo } from '../utils';
import { PlainElementAttribute } from '../global-data/global-data.types';
import { CustomElementAttribute } from '../custom-elements/custom-elements.types';

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

describe('constructElementAttrCompletion', () => {
  it('returns CompletionEntry for a plain html attribute', () => {
    const attrDef: PlainElementAttribute = {
      name: 'test',
      description: 'test description',
      type: 'boolean',
    };
    expect(constructElementAttrCompletion(attrDef)).toEqual({
      insertText: 'test',
      kind: 'parameter',
      kindModifiers: '',
      labelDetails: {
        description: '[attr] HTML Element',
        detail: ' boolean',
      },
      name: 'test',
      sortText: 'a',
    });
  });

  it('returns CompletionEntry for a custom element attribute', () => {
    const attrDef: CustomElementAttribute = {
      name: 'test',
      description: 'test description',
      type: 'string',
      deprecated: true,
      referenceClass: 'ClassName',
    };
    expect(constructElementAttrCompletion(attrDef)).toEqual({
      insertText: 'test=""',
      kind: 'parameter',
      kindModifiers: 'deprecated',
      labelDetails: {
        description: '(deprecated) [attr] ClassName',
        detail: ' string',
      },
      name: 'test',
      sortText: 'a',
    });
  });
});
