import { CompletionEntry, ScriptElementKind } from 'typescript/lib/tsserverlibrary';
import { GlobalAttrType } from '../global-data/global-data.types';

export function constructGlobalAriaCompletion(name: string): CompletionEntry {
  return {
    name,
    insertText: `${name}=""`,
    kind: ScriptElementKind.parameterElement,
    sortText: 'z',
    labelDetails: {
      description: '[attr] Aria',
    },
  };
}

export function constructGlobalEventCompletion(name: string): CompletionEntry {
  return {
    name,
    insertText: `${name}=""`,
    kind: ScriptElementKind.parameterElement,
    sortText: 'z',
    labelDetails: {
      description: '[attr] Event',
      detail: ' event',
    },
  };
}

export function constructGlobalAttrCompletion(name: string, type: GlobalAttrType): CompletionEntry {
  switch (type) {
    case 'string':
      return {
        name,
        insertText: `${name}=""`,
        kind: ScriptElementKind.parameterElement,
        sortText: 'm',
        labelDetails: {
          description: '[attr] Global',
          detail: ' string',
        },
      };
    case 'boolean':
      return {
        name,
        insertText: name,
        kind: ScriptElementKind.parameterElement,
        sortText: 'm',
        labelDetails: {
          description: '[attr] Global',
          detail: ' boolean',
        },
      };
    case 'wildcard':
      return {
        name,
        insertText: name.replace('*', '$1="${$2}"$0'),
        isSnippet: true,
        kind: ScriptElementKind.parameterElement,
        sortText: 'm',
        labelDetails: {
          description: '[attr] Global',
          detail: ' string',
        },
      };
  }
}
