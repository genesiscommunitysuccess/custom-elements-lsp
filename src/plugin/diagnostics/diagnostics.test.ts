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

  it("Correct warnings when one invalid tag is a substring of another invalid tag", () => {
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

  it("Correct warnings when the same invalid tag is on one line multiple times", () => {
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

  it("Correct warnings when tag on the same line and substring of another", () => {
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
});
