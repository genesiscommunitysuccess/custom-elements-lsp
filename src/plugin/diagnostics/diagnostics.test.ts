import parse from "node-html-parser";
import { TemplateContext } from "typescript-template-language-service-decorator";
import { buildDefaultCEFake } from "../../jest/custom-elements-resource";
import { getLogger, html } from "../../jest/utils";
import { CustomElementsResource } from "../transformer/custom-elements-resource";
import { DiagnosticsService } from "./diagnostics";

const getDiagnosticsService = (ce: CustomElementsResource) =>
  new DiagnosticsService(getLogger(), ce);

const getElements = (context: TemplateContext) =>
  parse(context.text).querySelectorAll("*");

describe("getPositionOfNthTagEnd", () => {
  const tests: [string, [TemplateContext, string, number], any][] = [
    ["-2 for an invalid occurrence", [html``, "a", 0], -2],
    ["-1 for empty string", [html``, "a", 1], -1],
    ["-1 if the occurrence is too high", [html`<c-e></c-e>`, "c-e", 2], -1],
    [
      "the end of the first and only occurrence",
      [html`<c-e></c-e>`, "c-e", 1],
      4,
    ],
    [
      "the end of the first occurrence if requested",
      [html`<c-e></c-e><c-e></c-e>`, "c-e", 1],
      4,
    ],
    [
      "the end of the second occurrence if requested",
      [html`<c-e></c-e><c-e></c-e>`, "c-e", 2],
      15,
    ],
    [
      "the end of the third occurrence if requested",
      [html`<c-e></c-e><c-e></c-e><c-e></c-e>`, "c-e", 3],
      26,
    ],
    [
      "the end of an occurrence in the middle",
      [html`<c-e></c-e><c-e></c-e><c-e></c-e>`, "c-e", 2],
      15,
    ],
  ];

  for (const [name, [context, tagName, occurrence], expected] of tests) {
    const service = getDiagnosticsService(buildDefaultCEFake());
    it(name, () => {
      // Need to use `as any` because the function is private.
      const result = (service as any).getPositionOfNthTagEnd({
        context,
        tagName,
        occurrence,
      });
      expect(result).toEqual(expected);
    });
  }
});

describe("getUnknownCETag", () => {
  it("No diagnostics for an empty template", () => {
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html``;
    const elementList = getElements(context);
    const result = service.getUnknownCETag(context, elementList);
    expect(result.length).toEqual(0);
  });

  it("No diagnostics for standard html elements", () => {
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html`<template>
      <div>
        <invalid></invalid>
      </div>
    </template>`;
    const elementList = getElements(context);
    const result = service.getUnknownCETag(context, elementList);
    expect(result.length).toEqual(0);
  });

  it("Warning diagnostics for unknown custom elements", () => {
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html`<template>
      <div>
        <invalid-ce></invalid-ce>
        <test-ce></test-ce>
      </div>
    </template>`;
    const elementList = getElements(context);
    const result = service.getUnknownCETag(context, elementList);
    expect(result).toEqual([
      {
        category: 0,
        code: 0,
        file: "test.ts",
        length: 10,
        messageText: "Unknown custom element: invalid-ce",
        start: 32,
      },
      {
        category: 0,
        code: 0,
        file: "test.ts",
        length: 7,
        messageText: "Unknown custom element: test-ce",
        start: 66,
      },
    ]);
  });

  it("Correct warnings when one unknown tag is a substring of another unknown tag", () => {
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html`<template>
      <div>
        <another-invalid-ce></another-invalid-ce>
        <invalid-ce></invalid-ce>
      </div>
    </template>`;
    const elementList = getElements(context);
    const result = service.getUnknownCETag(context, elementList);
    expect(result).toEqual([
      {
        category: 0,
        code: 0,
        file: "test.ts",
        length: 18,
        messageText: "Unknown custom element: another-invalid-ce",
        start: 32,
      },
      {
        category: 0,
        code: 0,
        file: "test.ts",
        length: 10,
        messageText: "Unknown custom element: invalid-ce",
        start: 82,
      },
    ]);
  });

  it("Correct warnings when the same unknown tag is on one line multiple times", () => {
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html`<template>
      <div><invalid-ce></invalid-ce><invalid-ce></invalid-ce></div>
    </template>`;
    const elementList = getElements(context);
    const result = service.getUnknownCETag(context, elementList);
    expect(result).toEqual([
      {
        category: 0,
        code: 0,
        file: "test.ts",
        length: 10,
        messageText: "Unknown custom element: invalid-ce",
        start: 23,
      },
      {
        category: 0,
        code: 0,
        file: "test.ts",
        length: 10,
        messageText: "Unknown custom element: invalid-ce",
        start: 48,
      },
    ]);
  });

  it("Correct warnings when unknown tag on the same line and substring of another", () => {
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html`<template>
      <div>
        <invalid-ce></invalid-ce><invalid-ce></invalid-ce>
        <another-invalid-ce></another-invalid-ce>
      </div>
    </template>`;
    const elementList = getElements(context);
    const result = service.getUnknownCETag(context, elementList);
    expect(result).toEqual([
      {
        category: 0,
        code: 0,
        file: "test.ts",
        length: 10,
        messageText: "Unknown custom element: invalid-ce",
        start: 32,
      },
      {
        category: 0,
        code: 0,
        file: "test.ts",
        length: 10,
        messageText: "Unknown custom element: invalid-ce",
        start: 57,
      },
      {
        category: 0,
        code: 0,
        file: "test.ts",
        length: 18,
        messageText: "Unknown custom element: another-invalid-ce",
        start: 91,
      },
    ]);
  });

  it("No diagnostics when we only have known custom elements", () => {
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html`<template>
      <no-attr></no-attr>
      <custom-element activated></custom-element>
    </template>`;
    const elementList = getElements(context);
    const result = service.getUnknownCETag(context, elementList);
    expect(result.length).toEqual(0);
  });

  it("Diagnostics for invalid elements when there are known elements too", () => {
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html`<template>
      <no-attr></no-attr>
      <custom-element activated></custom-element>
      <no-at></no-at>
    </template>`;
    const elementList = getElements(context);
    const result = service.getUnknownCETag(context, elementList);
    expect(result).toEqual([
      {
        category: 0,
        code: 0,
        file: "test.ts",
        length: 5,
        messageText: "Unknown custom element: no-at",
        start: 94,
      },
    ]);
  });
});

describe("getInvalidCEAttribute", () => {
  it("No diagnostics for an empty template", () => {
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html``;
    const elementList = getElements(context);
    const result = service.getInvalidCEAttribute(context, elementList);
    expect(result.length).toEqual(0);
  });

  it("No diagnostics for standard html elements", () => {
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html`<template>
      <div>
        <invalid></invalid>
      </div>
    </template>`;
    const elementList = getElements(context);
    const result = service.getInvalidCEAttribute(context, elementList);
    expect(result.length).toEqual(0);
  });

  it("No diagnostics for unknown custom elements", () => {
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html`<template>
      <unknown-element></unknown-element>
    </template>`;
    const elementList = getElements(context);
    const result = service.getInvalidCEAttribute(context, elementList);
    expect(result.length).toEqual(0);
  });

  it("No diagnostics for all correct attributes", () => {
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html`<template>
      <unknown-element></unknown-element>
      <no-attr></no-attr>
      <custom-element activated colour="red"></custom-element>
    </template>`;
    const elementList = getElements(context);
    const result = service.getInvalidCEAttribute(context, elementList);
    expect(result.length).toEqual(0);
  });

  it("Diagnostics for invalid attributes on known custom elements", () => {
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html`<template>
      <unknown-element></unknown-element>
      <no-attr invalidattr></no-attr>
      <custom-element
        activated
        colour="red"
        alsoinvalid="test"
      ></custom-element>
    </template>`;
    const elementList = getElements(context);
    const result = service.getInvalidCEAttribute(context, elementList);
    expect(result).toEqual([
      {
        category: 1,
        code: 0,
        file: "test.ts",
        length: 11,
        messageText:
          "Unknown attribute: invalidattr for custom element no-attr",
        start: 68,
      },
      {
        category: 1,
        code: 0,
        file: "test.ts",
        length: 11,
        messageText:
          "Unknown attribute: alsoinvalid for custom element custom-element",
        start: 160,
      },
    ]);
  });

  // TODO: handled in FUI-1193
  it("Temp: Diagnostics for a FAST properties are ignored", () => {
    const nothing = "";
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html`<template>
      <unknown-element></unknown-element>
      <no-attr :test=${(_) => nothing}></no-attr>
    </template>`;
    const elementList = getElements(context);
    const result = service.getInvalidCEAttribute(context, elementList);
    expect(result.length).toEqual(0);
  });

  it("Diagnostics for a FAST ref() are ignored", () => {
    const ref = (x: any) => () => "";
    const service = getDiagnosticsService(buildDefaultCEFake());
    const context = html`<template>
      <unknown-element></unknown-element>
      <no-attr ${ref("test")}></no-attr>
    </template>`;
    const elementList = getElements(context);
    const result = service.getInvalidCEAttribute(context, elementList);
    expect(result.length).toEqual(0);
  });
});
