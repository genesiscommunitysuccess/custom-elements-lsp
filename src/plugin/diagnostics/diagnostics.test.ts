import parse from 'node-html-parser';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import { getCEServiceFromStubbedResource } from '../../jest/custom-elements';
import { buildServices, getLogger, html } from '../../jest/utils';
import { CustomElementsService } from '../custom-elements/custom-elements.types';
import { CoreDiagnosticsServiceImpl } from './diagnostics';

const getDiagnosticsService = (ce: CustomElementsService) =>
  new CoreDiagnosticsServiceImpl(getLogger(), buildServices({ customElements: ce }));

const getElements = (context: TemplateContext) => parse(context.text).querySelectorAll('*');

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
        code: 0,
        file: 'test.ts',
        length: 10,
        messageText: 'Unknown custom element: invalid-ce',
        start: 43,
      },
      {
        category: 0,
        code: 0,
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
        code: 0,
        file: 'test.ts',
        length: 18,
        messageText: 'Unknown custom element: another-invalid-ce',
        start: 43,
      },
      {
        category: 0,
        code: 0,
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
        code: 0,
        file: 'test.ts',
        length: 10,
        messageText: 'Unknown custom element: invalid-ce',
        start: 43,
      },
      {
        category: 0,
        code: 0,
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
        code: 0,
        file: 'test.ts',
        length: 10,
        messageText: 'Unknown custom element: invalid-ce',
        start: 43,
      },
      {
        category: 0,
        code: 0,
        file: 'test.ts',
        length: 10,
        messageText: 'Unknown custom element: invalid-ce',
        start: 79,
      },
      {
        category: 0,
        code: 0,
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
        code: 0,
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
        code: 0,
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
    const result = (service as any).getInvalidCEAttribute(context, elementList);
    expect(result).toEqual([
      {
        category: 1,
        code: 0,
        file: 'test.ts',
        length: 11,
        messageText: 'Unknown attribute: invalidattr for custom element no-attr',
        start: 79,
      },
      {
        category: 1,
        code: 0,
        file: 'test.ts',
        length: 11,
        messageText: 'Unknown attribute: alsoinvalid for custom element custom-element',
        start: 149,
      },
    ]);
  });

  // TODO: handled in FUI-1193
  it('Temp: Diagnostics for a FAST properties are ignored', () => {
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
    const ref = (x: any) => () => '';
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
