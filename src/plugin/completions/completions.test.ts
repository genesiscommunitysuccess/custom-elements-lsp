import { TemplateContext } from "typescript-template-language-service-decorator";
import { LineAndCharacter } from "typescript/lib/tsserverlibrary";
import { getCEServiceFromStubbedResource } from "../../jest/custom-elements";
import { getGDServiceFromStubbedResource } from "../../jest/global-data";
import { buildServices, getLogger, html } from "../../jest/utils";
import { CustomElementsService } from "../custom-elements/custom-elements.types";
import { GlobalDataService } from "../global-data/global-data.types";
import { CoreCompletionsServiceImpl } from "./completions";

const getCompletionsService = (
  ceRes: CustomElementsService = getCEServiceFromStubbedResource(),
  gdRes: GlobalDataService = getGDServiceFromStubbedResource()
) =>
  new CoreCompletionsServiceImpl(
    getLogger(),
    buildServices({ customElements: ceRes, globalData: gdRes })
  );

const globalDataAttributeAssersions = [
  {
    insertText: 'data-*=""',
    kind: "parameter",
    kindModifiers: "global-attribute",
    labelDetails: {
      description: "[attr] Global",
    },
    name: "data-*",
    sortText: "m",
  },
  {
    insertText: 'class=""',
    kind: "parameter",
    kindModifiers: "global-attribute",
    labelDetails: {
      description: "[attr] Global",
    },
    name: "class",
    sortText: "m",
  },
  {
    insertText: 'aria-label=""',
    kind: "parameter",
    kindModifiers: "aria-attribute",
    labelDetails: {
      description: "[attr] Aria",
    },
    name: "aria-label",
    sortText: "z",
  },
];

describe("getCompletionType", () => {
  const tests: [string, [TemplateContext, LineAndCharacter], any][] = [
    [
      'Key "none" for a blank template',
      [html``, { line: 0, character: 0 }],
      { key: "none", params: undefined },
    ],
    [
      'Key "none" after a fully closed custom element',
      [html`<c-e></c-e>`, { line: 0, character: 11 }],
      { key: "none", params: undefined },
    ],
    [
      'Key "none" after a fully closed element',
      [html`<div></div>`, { line: 0, character: 11 }],
      { key: "none", params: undefined },
    ],
    [
      'Key "none" after a self closing element',
      [html`<input />`, { line: 0, character: 9 }],
      { key: "none", params: undefined },
    ],
    [
      'Key "none" after in invalid empty tag',
      [html`<>`, { line: 0, character: 2 }],
      { key: "none", params: undefined },
    ],
    [
      'Key "none" after an unclosed tag',
      [html`<div></div>`, { line: 0, character: 5 }],
      { key: "none", params: undefined },
    ],
    // custom-element-name
    [
      'Key "custom-element-name" after an opening tag',
      [html`<`, { line: 0, character: 1 }],
      { key: "custom-element-name", params: undefined },
    ],
    [
      'Key "custom-element-name" after an opening with characters',
      [html`<di`, { line: 0, character: 3 }],
      { key: "custom-element-name", params: undefined },
    ],
    [
      'Key "custom-element-name" after an opening with characters, after a valid tag',
      [html`<div></div><di`, { line: 0, character: 14 }],
      { key: "custom-element-name", params: undefined },
    ],
    // custom-element-attribute, with custom element name
    [
      'Key "custom-element-attribute" after the start of a custom element, and the name',
      [html`<cus-`, { line: 0, character: 5 }],
      { key: "custom-element-attribute", params: "cus-" },
    ],
    [
      'Key "custom-element-attribute" after a custom element, and the name',
      [html`<cus-elem`, { line: 0, character: 9 }],
      { key: "custom-element-attribute", params: "cus-elem" },
    ],
    [
      'Key "custom-element-attribute" after a custom element accounting for another custom element',
      [html`<ce-elem></ce-elem><cus-elem`, { line: 0, character: 28 }],
      { key: "custom-element-attribute", params: "cus-elem" },
    ],
    [
      'Key "custom-element-attribute" and gets custom element name when attribute is present',
      [html`<ce-elem></ce-elem><cus-elem attr`, { line: 0, character: 33 }],
      { key: "custom-element-attribute", params: "cus-elem" },
    ],
    [
      'Key "custom-element-attribute" and gets custom element name when string attribute is present',
      [
        html`<ce-elem></ce-elem><cus-elem attr="value"`,
        { line: 0, character: 41 },
      ],
      { key: "custom-element-attribute", params: "cus-elem" },
    ],
    [
      'Key "custom-element-attribute" and gets custom element when curso is inside of a fully closed element',
      [
        html`<ce-elem></ce-elem><cus-elem attr="value"></cus-elem>`,
        { line: 0, character: 41 },
      ],
      { key: "custom-element-attribute", params: "cus-elem" },
    ],
  ];

  for (const test of tests) {
    const [name, [context, lineAndChar], expected] = test;
    it(name, () => {
      const service = getCompletionsService();
      // `getComptionType` is private so need to case to `any` to test it
      const result = (service as any).getComptionType(context, lineAndChar);
      expect(result).toEqual(expected);
    });
  }
});

describe("getCompletionsAtPosition", () => {
  it("Returns no completions if we are in a blank template", () => {
    const service = getCompletionsService();
    const context = html``;

    const completions = service.getCompletionsAtPosition(context, {
      line: 0,
      character: 0,
    });

    expect(completions.entries).toHaveLength(0);
  });

  it("Returns completions for the custom element tags if inside of an opening tag", () => {
    const service = getCompletionsService();
    const context = html`<`;

    const completions = service.getCompletionsAtPosition(context, {
      line: 0,
      character: 1,
    });

    expect(completions.entries).toEqual([
      {
        insertText: "custom-element></custom-element>",
        kind: "type",
        kindModifiers: "custom-element",
        name: "custom-element",
        sortText: "custom-element",
        labelDetails: {
          description: "src/components/avatar/avatar.ts",
        },
      },
      {
        insertText: "no-attr></no-attr>",
        kind: "type",
        kindModifiers: "custom-element",
        name: "no-attr",
        sortText: "custom-element",
        labelDetails: {
          description: "pkg",
        },
      },
    ]);
  });

  it("Returns completions for the custom element tags if inside of an opening with an incomplete custom element", () => {
    const service = getCompletionsService();
    const context = html`<custom-eleme`;

    const completions = service.getCompletionsAtPosition(context, {
      line: 0,
      character: 13,
    });

    expect(completions.entries).toEqual([
      {
        insertText: "custom-element></custom-element>",
        kind: "type",
        kindModifiers: "custom-element",
        name: "custom-element",
        sortText: "custom-element",
        labelDetails: {
          description: "src/components/avatar/avatar.ts",
        },
      },
      {
        insertText: "no-attr></no-attr>",
        kind: "type",
        kindModifiers: "custom-element",
        name: "no-attr",
        sortText: "custom-element",
        labelDetails: {
          description: "pkg",
        },
      },
    ]);
  });

  it("Returns attribute completions when past a valid custom element name which has defined attributes", () => {
    const service = getCompletionsService();
    const context = html`<custom-element `;

    const completions = service.getCompletionsAtPosition(context, {
      line: 0,
      character: 16,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'colour=""',
        kind: "parameter",
        kindModifiers: "custom-element-attribute",
        labelDetails: {
          description: "[attr] CustomElement",
        },
        name: "colour",
        sortText: "a",
      },
      {
        insertText: "activated",
        kind: "parameter",
        kindModifiers: "custom-element-attribute",
        labelDetails: {
          description: "[attr] CustomElement",
        },
        name: "activated",
        sortText: "a",
      },
      ...globalDataAttributeAssersions,
    ]);
  });

  it("Returns attribute completions when writing an attribute", () => {
    const service = getCompletionsService();
    const context = html`<custom-element col`;

    const completions = service.getCompletionsAtPosition(context, {
      line: 0,
      character: 19,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'colour=""',
        kind: "parameter",
        kindModifiers: "custom-element-attribute",
        labelDetails: {
          description: "[attr] CustomElement",
        },
        name: "colour",
        sortText: "a",
      },
      {
        insertText: "activated",
        kind: "parameter",
        kindModifiers: "custom-element-attribute",
        labelDetails: {
          description: "[attr] CustomElement",
        },
        name: "activated",
        sortText: "a",
      },
      ...globalDataAttributeAssersions,
    ]);
  });

  it("Returns attribute completions when writing an attribute inside of a finished tag", () => {
    const service = getCompletionsService();
    const context = html`<custom-element colour="red"></custom-element>`;

    const completions = service.getCompletionsAtPosition(context, {
      line: 0,
      character: 28,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'colour=""',
        kind: "parameter",
        kindModifiers: "custom-element-attribute",
        labelDetails: {
          description: "[attr] CustomElement",
        },
        name: "colour",
        sortText: "a",
      },
      {
        insertText: "activated",
        kind: "parameter",
        kindModifiers: "custom-element-attribute",
        labelDetails: {
          description: "[attr] CustomElement",
        },
        name: "activated",
        sortText: "a",
      },
      ...globalDataAttributeAssersions,
    ]);
  });

  it("Returns only the global attribute completions when we try and complete attributes on a custom element with no attributes", () => {
    const service = getCompletionsService();
    const context = html`<no-attr `;

    const completions = service.getCompletionsAtPosition(context, {
      line: 0,
      character: 9,
    });

    expect(completions.entries).toEqual([...globalDataAttributeAssersions]);
  });

  it("Returns name completions when we try and complete attributes on an unknown custom element", () => {
    const service = getCompletionsService();
    const context = html`<unknown-element `;

    const completions = service.getCompletionsAtPosition(context, {
      line: 0,
      character: 17,
    });

    expect(completions.entries).toEqual([
      {
        insertText: "custom-element></custom-element>",
        kind: "type",
        kindModifiers: "custom-element",
        name: "custom-element",
        sortText: "custom-element",
        labelDetails: {
          description: "src/components/avatar/avatar.ts",
        },
      },
      {
        insertText: "no-attr></no-attr>",
        kind: "type",
        kindModifiers: "custom-element",
        name: "no-attr",
        sortText: "custom-element",
        labelDetails: {
          description: "pkg",
        },
      },
    ]);
  });
});
