import { CompletionInfo } from 'typescript/lib/tsserverlibrary';
import { getCEServiceFromStubbedResource } from '../../jest/custom-elements';
import {
  getGDServiceFromStubbedResource,
  globalDataAttributeAssersions,
  globalDataNameCompletions,
} from '../../jest/global-data';
import { buildServices, getLogger, html } from '../../jest/utils';
import { CustomElementsService } from '../custom-elements/custom-elements.types';
import { GlobalDataService } from '../global-data/global-data.types';
import { getTokenTypeWithInfo } from '../utils';
import { CoreCompletionsServiceImpl } from './completions';

const getCompletionsService = (
  ceRes: CustomElementsService = getCEServiceFromStubbedResource(),
  gdRes: GlobalDataService = getGDServiceFromStubbedResource(),
) =>
  new CoreCompletionsServiceImpl(
    getLogger(),
    buildServices({ customElements: ceRes, globalData: gdRes }),
  );

const baseCompletionInfo: CompletionInfo = {
  isGlobalCompletion: false,
  isMemberCompletion: false,
  isNewIdentifierLocation: false,
  entries: [],
};

describe('getCompletionsAtPosition', () => {
  it('Returns no completions if we are in a blank template', () => {
    const service = getCompletionsService();
    const context = html``;
    const position = {
      line: 0,
      character: 0,
    };
    const typeAndParam = getTokenTypeWithInfo(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toHaveLength(0);
  });

  it('Returns completions for the custom element and html tags if inside of an opening tag', () => {
    const service = getCompletionsService();
    const context = html`
      <
    `;
    const position = {
      line: 1,
      character: 7,
    };
    const typeAndParam = getTokenTypeWithInfo(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'custom-element></custom-element>',
        kind: 'type',
        name: 'custom-element',
        sortText: 'custom-element',
        labelDetails: {
          description: 'src/components/avatar/avatar.ts',
        },
      },
      {
        insertText: 'no-attr></no-attr>',
        kind: 'type',
        name: 'no-attr',
        sortText: 'custom-element',
        labelDetails: {
          description: 'pkg',
        },
      },
      ...globalDataNameCompletions,
    ]);
  });

  it('Returns completions for the custom element and html tags if inside of an opening with an incomplete custom element', () => {
    const service = getCompletionsService();
    const context = html`<custom-eleme`;
    const position = {
      line: 0,
      character: 13,
    };
    const typeAndParam = getTokenTypeWithInfo(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'custom-element></custom-element>',
        kind: 'type',
        name: 'custom-element',
        sortText: 'custom-element',
        labelDetails: {
          description: 'src/components/avatar/avatar.ts',
        },
      },
      {
        insertText: 'no-attr></no-attr>',
        kind: 'type',
        name: 'no-attr',
        sortText: 'custom-element',
        labelDetails: {
          description: 'pkg',
        },
      },
      ...globalDataNameCompletions,
    ]);
  });

  it('Returns completions for the custom element and html tags if inside of an opening with an incomplete html element', () => {
    const service = getCompletionsService();
    const context = html`<im`;
    const position = {
      line: 0,
      character: 3,
    };
    const typeAndParam = getTokenTypeWithInfo(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'custom-element></custom-element>',
        kind: 'type',
        name: 'custom-element',
        sortText: 'custom-element',
        labelDetails: {
          description: 'src/components/avatar/avatar.ts',
        },
      },
      {
        insertText: 'no-attr></no-attr>',
        kind: 'type',
        name: 'no-attr',
        sortText: 'custom-element',
        labelDetails: {
          description: 'pkg',
        },
      },
      ...globalDataNameCompletions,
    ]);
  });

  it('Returns completions for the custom element and html tags after an incomplete or unknown html element', () => {
    const service = getCompletionsService();
    const context = html`<im `;
    const position = {
      line: 0,
      character: 4,
    };
    const typeAndParam = getTokenTypeWithInfo(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'custom-element></custom-element>',
        kind: 'type',
        name: 'custom-element',
        sortText: 'custom-element',
        labelDetails: {
          description: 'src/components/avatar/avatar.ts',
        },
      },
      {
        insertText: 'no-attr></no-attr>',
        kind: 'type',
        name: 'no-attr',
        sortText: 'custom-element',
        labelDetails: {
          description: 'pkg',
        },
      },
      ...globalDataNameCompletions,
    ]);
  });

  it('Returns attribute completions when past a valid custom element name which has defined attributes', () => {
    const service = getCompletionsService();
    const context = html`<custom-element `;
    const position = {
      line: 0,
      character: 16,
    };
    const typeAndParam = getTokenTypeWithInfo(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'colour=""',
        kind: 'parameter',
        labelDetails: {
          description: '[attr] CustomElement',
          detail: ' string',
        },
        name: 'colour',
        sortText: 'a',
        kindModifiers: '',
      },
      {
        insertText: 'activated',
        kind: 'parameter',
        labelDetails: {
          description: '(deprecated) [attr] CustomElement',
          detail: ' boolean',
        },
        name: 'activated',
        sortText: 'a',
        kindModifiers: 'deprecated',
      },
      ...globalDataAttributeAssersions,
    ]);
  });

  it('Returns attribute completions when past a valid plain element name which has defined attributes', () => {
    const service = getCompletionsService();
    const context = html`<a `;
    const position = {
      line: 0,
      character: 3,
    };
    const typeAndParam = getTokenTypeWithInfo(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'href=""',
        kind: 'parameter',
        kindModifiers: '',
        labelDetails: {
          description: '[attr] HTML Element',
          detail: ' string',
        },
        name: 'href',
        sortText: 'a',
      },
      {
        insertText: 'align=""',
        kind: 'parameter',
        kindModifiers: 'deprecated',
        labelDetails: {
          description: '(deprecated) [attr] HTML Element',
          detail: ' string',
        },
        name: 'align',
        sortText: 'a',
      },
      ...globalDataAttributeAssersions,
    ]);
  });

  it('Returns attribute completions when writing an attribute', () => {
    const service = getCompletionsService();
    const context = html`<custom-element col`;
    const position = {
      line: 0,
      character: 19,
    };
    const typeAndParam = getTokenTypeWithInfo(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'colour=""',
        kind: 'parameter',
        labelDetails: {
          description: '[attr] CustomElement',
          detail: ' string',
        },
        name: 'colour',
        sortText: 'a',
        kindModifiers: '',
      },
      {
        insertText: 'activated',
        kind: 'parameter',
        labelDetails: {
          description: '(deprecated) [attr] CustomElement',
          detail: ' boolean',
        },
        name: 'activated',
        sortText: 'a',
        kindModifiers: 'deprecated',
      },
      ...globalDataAttributeAssersions,
    ]);
  });

  it('Returns attribute completions when past a valid plain element name and writing a known attribute', () => {
    const service = getCompletionsService();
    const context = html`<a hr`;
    const position = {
      line: 0,
      character: 5,
    };
    const typeAndParam = getTokenTypeWithInfo(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'href=""',
        kind: 'parameter',
        kindModifiers: '',
        labelDetails: {
          description: '[attr] HTML Element',
          detail: ' string',
        },
        name: 'href',
        sortText: 'a',
      },
      {
        insertText: 'align=""',
        kind: 'parameter',
        kindModifiers: 'deprecated',
        labelDetails: {
          description: '(deprecated) [attr] HTML Element',
          detail: ' string',
        },
        name: 'align',
        sortText: 'a',
      },
      ...globalDataAttributeAssersions,
    ]);
  });

  it('Returns attribute completions when writing an attribute inside of a finished tag', () => {
    const service = getCompletionsService();
    const context = html`
      <custom-element colour="red"></custom-element>
    `;
    const position = {
      line: 1,
      character: 34,
    };
    const typeAndParam = getTokenTypeWithInfo(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'colour=""',
        kind: 'parameter',
        labelDetails: {
          description: '[attr] CustomElement',
          detail: ' string',
        },
        name: 'colour',
        sortText: 'a',
        kindModifiers: '',
      },
      {
        insertText: 'activated',
        kind: 'parameter',
        labelDetails: {
          description: '(deprecated) [attr] CustomElement',
          detail: ' boolean',
        },
        name: 'activated',
        sortText: 'a',
        kindModifiers: 'deprecated',
      },
      ...globalDataAttributeAssersions,
    ]);
  });

  it('Returns only the global attribute completions when we try and complete attributes on a custom element with no attributes', () => {
    const service = getCompletionsService();
    const context = html`<no-attr `;
    const position = {
      line: 0,
      character: 28,
    };
    const typeAndParam = getTokenTypeWithInfo(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([...globalDataAttributeAssersions]);
  });

  it('Returns only the global attribute completions when we try and complete attributes on a plain element with no attributes', () => {
    const service = getCompletionsService();
    const context = html`<div `;
    const position = {
      line: 0,
      character: 5,
    };
    const typeAndParam = getTokenTypeWithInfo(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([...globalDataAttributeAssersions]);
  });

  it('Returns name completions when we try and complete attributes on an unknown custom element', () => {
    const service = getCompletionsService();
    const context = html`<unknown-element `;
    const position = {
      line: 0,
      character: 17,
    };
    const typeAndParam = getTokenTypeWithInfo(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'custom-element></custom-element>',
        kind: 'type',
        name: 'custom-element',
        sortText: 'custom-element',
        labelDetails: {
          description: 'src/components/avatar/avatar.ts',
        },
      },
      {
        insertText: 'no-attr></no-attr>',
        kind: 'type',
        name: 'no-attr',
        sortText: 'custom-element',
        labelDetails: {
          description: 'pkg',
        },
      },
      ...globalDataNameCompletions,
    ]);
  });
});
