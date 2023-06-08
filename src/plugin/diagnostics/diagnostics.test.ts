import parse from 'node-html-parser';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import { getCEServiceFromStubbedResource } from '../../jest/custom-elements';
import { buildServices, getLogger, html } from '../../jest/utils';
import { DUPLICATE_ATTRIBUTE, UNKNOWN_ATTRIBUTE } from '../constants/diagnostic-codes';
import { CustomElementsService } from '../custom-elements/custom-elements.types';
import { CoreDiagnosticsServiceImpl } from './diagnostics';
import { TagsWithAttrs } from './diagnostics.types';

const getDiagnosticsService = (ce: CustomElementsService) =>
  new CoreDiagnosticsServiceImpl(getLogger(), buildServices({ customElements: ce }));

const getElements = (context: TemplateContext) => parse(context.text).querySelectorAll('*');

// TODO
// If you specify a valid attribute multiple times, you should get warnings for subsequent ones
// If you specify an invalid attribute multiple times, you should get an error for each one

describe('getDiagnosticsService', () => {
  it('collates diagnostic info from methods in the class', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html``;
    const root = parse(context.text);
    const unknownTagSpy = jest.spyOn(service as any, 'getUnknownCETag');
    const unknownCEAttributeSpy = jest.spyOn(service as any, 'getInvalidCEAttribute');
    const result = service.getSemanticDiagnostics({ context, diagnostics: [], root });
    expect(result.length).toEqual(0);
    expect(unknownTagSpy).toHaveBeenCalledTimes(1);
    expect(unknownCEAttributeSpy).toHaveBeenCalledTimes(1);
  });
});

describe('getUnknownCETag', () => {
  it('No diagnostics for an empty template', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html``;
    const elementList = getElements(context);
    const result = (service as any).getUnknownCETag(context, elementList);
    expect(result.length).toEqual(0);
  });

  it('No diagnostics for standard html elements', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <div>
          <invalid></invalid>
        </div>
      </template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getUnknownCETag(context, elementList);
    expect(result.length).toEqual(0);
  });

  it('Warning diagnostics for unknown custom elements', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <div>
          <invalid-ce></invalid-ce>
          <test-ce></test-ce>
        </div>
      </template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getUnknownCETag(context, elementList);
    expect(result).toEqual([
      {
        category: 0,
        code: 1000,
        file: 'test.ts',
        length: 10,
        messageText: 'Unknown custom element: invalid-ce',
        start: 43,
      },
      {
        category: 0,
        code: 1000,
        file: 'test.ts',
        length: 7,
        messageText: 'Unknown custom element: test-ce',
        start: 79,
      },
    ]);
  });

  it('Correct warnings when one unknown tag is a substring of another unknown tag', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <div>
          <another-invalid-ce></another-invalid-ce>
          <invalid-ce></invalid-ce>
        </div>
      </template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getUnknownCETag(context, elementList);
    expect(result).toEqual([
      {
        category: 0,
        code: 1000,
        file: 'test.ts',
        length: 18,
        messageText: 'Unknown custom element: another-invalid-ce',
        start: 43,
      },
      {
        category: 0,
        code: 1000,
        file: 'test.ts',
        length: 10,
        messageText: 'Unknown custom element: invalid-ce',
        start: 95,
      },
    ]);
  });

  it('Correct warnings when the same unknown tag is on one line multiple times', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <div>
          <invalid-ce></invalid-ce>
          <invalid-ce></invalid-ce>
        </div>
      </template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getUnknownCETag(context, elementList);
    expect(result).toEqual([
      {
        category: 0,
        code: 1000,
        file: 'test.ts',
        length: 10,
        messageText: 'Unknown custom element: invalid-ce',
        start: 43,
      },
      {
        category: 0,
        code: 1000,
        file: 'test.ts',
        length: 10,
        messageText: 'Unknown custom element: invalid-ce',
        start: 79,
      },
    ]);
  });

  it('Correct warnings when unknown tag on the same line and substring of another', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <div>
          <invalid-ce></invalid-ce>
          <invalid-ce></invalid-ce>
          <another-invalid-ce></another-invalid-ce>
        </div>
      </template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getUnknownCETag(context, elementList);
    expect(result).toEqual([
      {
        category: 0,
        code: 1000,
        file: 'test.ts',
        length: 10,
        messageText: 'Unknown custom element: invalid-ce',
        start: 43,
      },
      {
        category: 0,
        code: 1000,
        file: 'test.ts',
        length: 10,
        messageText: 'Unknown custom element: invalid-ce',
        start: 79,
      },
      {
        category: 0,
        code: 1000,
        file: 'test.ts',
        length: 18,
        messageText: 'Unknown custom element: another-invalid-ce',
        start: 115,
      },
    ]);
  });

  it('No diagnostics when we only have known custom elements', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <no-attr></no-attr>
        <custom-element activated></custom-element>
      </template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getUnknownCETag(context, elementList);
    expect(result.length).toEqual(0);
  });

  it('Diagnostics for invalid elements when there are known elements too', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <no-attr></no-attr>
        <custom-element activated></custom-element>
        <no-at></no-at>
      </template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getUnknownCETag(context, elementList);
    expect(result).toEqual([
      {
        category: 0,
        code: 1000,
        file: 'test.ts',
        length: 5,
        messageText: 'Unknown custom element: no-at',
        start: 107,
      },
    ]);
  });

  it('Diagnostics for an unknown element if attributes are set', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template><no-at test-attr="test"></no-at></template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getUnknownCETag(context, elementList);
    expect(result).toEqual([
      {
        category: 0,
        code: 1000,
        file: 'test.ts',
        length: 5,
        messageText: 'Unknown custom element: no-at',
        start: 18,
      },
    ]);
  });
});

describe('getInvalidCEAttribute', () => {
  it('No diagnostics for an empty template', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html``;
    const elementList = getElements(context);
    const result = (service as any).getInvalidCEAttribute(context, elementList);
    expect(result.length).toEqual(0);
  });

  it('No diagnostics for standard html elements', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <div>
          <invalid></invalid>
        </div>
      </template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getInvalidCEAttribute(context, elementList);
    expect(result.length).toEqual(0);
  });

  it('No diagnostics for unknown custom elements', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <unknown-element></unknown-element>
      </template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getInvalidCEAttribute(context, elementList);
    expect(result.length).toEqual(0);
  });

  it('No diagnostics for all correct attributes', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <unknown-element></unknown-element>
        <no-attr></no-attr>
        <custom-element activated colour="red"></custom-element>
      </template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getInvalidCEAttribute(context, elementList);
    expect(result.length).toEqual(0);
  });

  it('Diagnostics for invalid attributes on known custom elements', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <unknown-element></unknown-element>
        <no-attr invalidattr></no-attr>
        <custom-element activated colour="red" alsoinvalid="test"></custom-element>
      </template>
    `;
    const elementList = getElements(context);
    debugger;
    const result = (service as any).getInvalidCEAttribute(context, elementList);
    expect(result).toEqual([
      {
        category: 1,
        code: 1001,
        file: 'test.ts',
        length: 11,
        messageText: 'Unknown attribute "invalidattr" for custom element "no-attr"',
        start: 79,
      },
      {
        category: 1,
        code: 1001,
        file: 'test.ts',
        length: 11,
        messageText: 'Unknown attribute "alsoinvalid" for custom element "custom-element"',
        start: 149,
      },
    ]);
  });

  it('Returns errors if the same invalid attribute is specified multiple times on an element', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <no-attr invalidattr invalidattr invalidattr></no-attr>
      </template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getInvalidCEAttribute(context, elementList);
    expect(result).toEqual([
      {
        category: 1,
        code: 1001,
        file: 'test.ts',
        length: 11,
        messageText: 'Unknown attribute "invalidattr" for custom element "no-attr"',
        start: 35,
      },
      {
        category: 1,
        code: 1001,
        file: 'test.ts',
        length: 11,
        messageText: 'Unknown attribute "invalidattr" for custom element "no-attr"',
        start: 47,
      },
      {
        category: 1,
        code: 1001,
        file: 'test.ts',
        length: 11,
        messageText: 'Unknown attribute "invalidattr" for custom element "no-attr"',
        start: 59,
      },
    ]);
  });

  it('Returns warnings for subsequent definitions of a valid attribute', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <custom-element colour="red" activated colour="blue" activated></custom-element>
      </template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getInvalidCEAttribute(context, elementList);
    expect(result).toEqual([
      {
        category: 0,
        code: 1002,
        file: 'test.ts',
        length: 6,
        messageText:
          'Duplicate setting of attribute "colour" which overrides the same attribute previously set on tag "custom-element"',
        start: 65,
      },
      {
        category: 0,
        code: 1002,
        file: 'test.ts',
        length: 9,
        messageText:
          'Duplicate setting of attribute "activated" which overrides the same attribute previously set on tag "custom-element"',
        start: 79,
      },
    ]);
  });

  // TODO: handled in FUI-1193
  it.skip('Temp: Diagnostics for a FAST properties are ignored', () => {
    const nothing = '';
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <unknown-element></unknown-element>
        <no-attr :test=${(_) => nothing}></no-attr>
      </template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getInvalidCEAttribute(context, elementList);
    expect(result.length).toEqual(0);
  });

  it('Diagnostics for a FAST ref() are ignored', () => {
    const ref = (_: any) => () => '';
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const context = html`
      <template>
        <unknown-element></unknown-element>
        <no-attr ${ref('test')}></no-attr>
      </template>
    `;
    const elementList = getElements(context);
    const result = (service as any).getInvalidCEAttribute(context, elementList);
    expect(result.length).toEqual(0);
  });
});

describe('buildAttributeDiagnosticMessage', () => {
  it('Throws an error when trying to build a message for a valid attribute', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    let e;
    try {
      (service as any).buildAttributeDiagnosticMessage('valid');
    } catch (error) {
      e = error;
    }
    expect((e as any).message).toEqual(
      'buildAttributeDiagnosticMessage: cannot build message for valid attribute'
    );
  });

  it('Returns an error with UNKNOWN_ATTRIBUTE code for an unknown classification', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const res = (service as any).buildAttributeDiagnosticMessage(
      'unknown',
      'attr',
      'custom-element',
      'test-file',
      5,
      10
    );

    expect(res).toEqual({
      category: 1,
      code: UNKNOWN_ATTRIBUTE,
      file: 'test-file',
      length: 10,
      messageText: 'Unknown attribute "attr" for custom element "custom-element"',
      start: 5,
    });
  });

  it('Returns an warning with DUPLICATE_ATTRIBUTE code for a duplicate classification', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const res = (service as any).buildAttributeDiagnosticMessage(
      'duplicate',
      'attr',
      'custom-element',
      'test-file',
      5,
      10
    );

    expect(res).toEqual({
      category: 0,
      code: DUPLICATE_ATTRIBUTE,
      file: 'test-file',
      length: 10,
      messageText:
        'Duplicate setting of attribute "attr" which overrides the same attribute previously set on tag "custom-element"',
      start: 5,
    });
  });
});

describe('buildInvalidAttrDefinitions', () => {
  it('returns an empty array for an empty input', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const res = (service as any).buildInvalidAttrDefinitions([]);
    expect(res).toEqual([]);
  });

  it('returns an empty array for a list that contains valid attributes only', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const tagsWithAttrs: TagsWithAttrs[] = [
      {
        tagName: 'custom-element',
        attrs: ['colour', 'activated'],
        tagNameOccurrence: 0,
      },
      {
        tagName: 'custom-element',
        attrs: ['colour'],
        tagNameOccurrence: 1,
      },
      {
        tagName: 'no-attr',
        attrs: [],
        tagNameOccurrence: 0,
      },
    ];
    const res = (service as any).buildInvalidAttrDefinitions(tagsWithAttrs);
    expect(res).toEqual([]);
  });

  it('returns a warning for a tag which contain multiple of the same valid attribute', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const tagsWithAttrs: TagsWithAttrs[] = [
      {
        tagName: 'custom-element',
        attrs: ['colour', 'activated', 'colour'],
        tagNameOccurrence: 0,
      },
      {
        tagName: 'custom-element',
        attrs: ['colour', 'colour'],
        tagNameOccurrence: 1,
      },
    ];
    const res = (service as any).buildInvalidAttrDefinitions(tagsWithAttrs);
    expect(res).toEqual([
      {
        attr: 'colour',
        attrOccurrence: 2,
        classification: 'duplicate',
        tagName: 'custom-element',
        tagNameOccurrence: 0,
      },
      {
        attr: 'colour',
        attrOccurrence: 2,
        classification: 'duplicate',
        tagName: 'custom-element',
        tagNameOccurrence: 1,
      },
    ]);
  });

  it('returns an error for every unknown attribute on every tag, accounting for duplicates', () => {
    const service = getDiagnosticsService(getCEServiceFromStubbedResource());
    const tagsWithAttrs: TagsWithAttrs[] = [
      {
        tagName: 'custom-element',
        attrs: ['colour', 'activated', 'unknown', 'unknown'],
        tagNameOccurrence: 0,
      },
      {
        tagName: 'custom-element',
        attrs: ['colour', 'colour', 'invalid'],
        tagNameOccurrence: 1,
      },
    ];
    const res = (service as any).buildInvalidAttrDefinitions(tagsWithAttrs);
    expect(res).toEqual([
      {
        attr: 'unknown',
        attrOccurrence: 1,
        classification: 'unknown',
        tagName: 'custom-element',
        tagNameOccurrence: 0,
      },
      {
        attr: 'unknown',
        attrOccurrence: 2,
        classification: 'unknown',
        tagName: 'custom-element',
        tagNameOccurrence: 0,
      },
      {
        attr: 'colour',
        attrOccurrence: 2,
        classification: 'duplicate',
        tagName: 'custom-element',
        tagNameOccurrence: 1,
      },
      {
        attr: 'invalid',
        attrOccurrence: 1,
        classification: 'unknown',
        tagName: 'custom-element',
        tagNameOccurrence: 1,
      },
    ]);
  });
});
