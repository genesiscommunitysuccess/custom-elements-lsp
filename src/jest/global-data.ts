import { CompletionEntry, ScriptElementKind } from 'typescript/lib/tsserverlibrary';
import { GlobalDataRepository } from '../custom-elements-plugin/global-data/global-data.types';
import { GlobalDataServiceImpl } from '../custom-elements-plugin/global-data/service';
import { getLogger } from './utils';

/**
 * Returns a real `GlobalDataServiceImpl` using a stubbed `GlobalDataRepository`
 * as the resource
 */
export const getGDServiceFromStubbedResource = () => {
  const resource: GlobalDataRepository = {
    getAttributes() {
      return [
        ['data-*', 'wildcard'],
        ['class', 'string'],
        ['autofocus', 'boolean'],
      ];
    },
    getAriaAttributes() {
      return ['aria-label'];
    },
    getEvents() {
      return ['onclick'];
    },
    getHTMLElementTags() {
      return ['div', 'img', 'p', 'a', 'template'];
    },
    getHTMLAttributes(tagName) {
      if (tagName !== 'a') {
        return [];
      }
      return [
        {
          name: 'href',
          description: 'The URL of a linked resource.',
          type: 'string',
          deprecated: false,
        },
        {
          name: 'align',
          description: 'Set vertical alignment.',
          type: 'string',
          deprecated: true,
        },
      ];
    },
    getHTMLInfo(tagName) {
      if (tagName !== 'a') {
        return undefined;
      }
      return {
        tagName: 'a',
        description:
          'Together with its href attribute, creates a hyperlink to web pages, files, email addresses, locations within the current page, or anything else a URL can address.',
      };
    },
  };

  return new GlobalDataServiceImpl(getLogger(), resource);
};

export const globalDataAttributeAssersions = [
  {
    insertText: 'data-$1="${$2}"$0',
    isSnippet: true,
    kind: 'parameter',
    labelDetails: {
      description: '[attr] Global',
      detail: ' string',
    },
    name: 'data-*',
    sortText: 'm',
  },
  {
    insertText: 'class=""',
    kind: 'parameter',
    labelDetails: {
      description: '[attr] Global',
      detail: ' string',
    },
    name: 'class',
    sortText: 'm',
  },
  {
    insertText: 'autofocus',
    kind: 'parameter',
    labelDetails: {
      description: '[attr] Global',
      detail: ' boolean',
    },
    name: 'autofocus',
    sortText: 'm',
  },
  {
    insertText: 'aria-label=""',
    kind: 'parameter',
    labelDetails: {
      description: '[attr] Aria',
    },
    name: 'aria-label',
    sortText: 'z',
  },
  {
    insertText: 'onclick=""',
    kind: 'parameter',
    labelDetails: {
      description: '[attr] Event',
      detail: ' event',
    },
    name: 'onclick',
    sortText: 'z',
  },
];

export const globalDataNameCompletions: CompletionEntry[] = [
  {
    insertText: 'div></div>',
    kind: ScriptElementKind.constElement,
    labelDetails: {
      description: 'HTML Element',
    },
    name: 'div',
    sortText: 'html-element',
  },
  {
    insertText: 'img></img>',
    kind: ScriptElementKind.constElement,
    labelDetails: {
      description: 'HTML Element',
    },
    name: 'img',
    sortText: 'html-element',
  },
  {
    insertText: 'p></p>',
    kind: ScriptElementKind.constElement,
    labelDetails: {
      description: 'HTML Element',
    },
    name: 'p',
    sortText: 'html-element',
  },
  {
    insertText: 'a></a>',
    kind: ScriptElementKind.constElement,
    labelDetails: {
      description: 'HTML Element',
    },
    name: 'a',
    sortText: 'html-element',
  },
  {
    insertText: 'template></template>',
    kind: ScriptElementKind.constElement,
    labelDetails: {
      description: 'HTML Element',
    },
    name: 'template',
    sortText: 'html-element',
  },
];
