import { CompletionInfo } from "typescript/lib/tsserverlibrary";
import { getCEServiceFromStubbedResource } from "../../jest/custom-elements";
import { getGDServiceFromStubbedResource } from "../../jest/global-data";
import { buildServices, getLogger, html } from "../../jest/utils";
import { CustomElementsService } from "../custom-elements/custom-elements.types";
import { GlobalDataService } from "../global-data/global-data.types";
import { CoreCompletionsServiceImpl } from "./completions";
import { getCompletionType } from "./helpers";

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
    insertText: 'data-$1="${$2}"$0',
    isSnippet: true,
    kind: "parameter",
    kindModifiers: "global-attribute",
    labelDetails: {
      description: "[attr] Global",
      detail: " string",
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
      detail: " string",
    },
    name: "class",
    sortText: "m",
  },
  {
    insertText: "autofocus",
    kind: "parameter",
    kindModifiers: "global-attribute",
    labelDetails: {
      description: "[attr] Global",
      detail: " boolean",
    },
    name: "autofocus",
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
  {
    insertText: 'onclick=""',
    kind: "parameter",
    kindModifiers: "event-attribute",
    labelDetails: {
      description: "[attr] Event",
    },
    name: "onclick",
    sortText: "z",
  },
];

const baseCompletionInfo: CompletionInfo = {
  isGlobalCompletion: false,
  isMemberCompletion: false,
  isNewIdentifierLocation: false,
  entries: [],
};

describe("getCompletionsAtPosition", () => {
  it("Returns no completions if we are in a blank template", () => {
    const service = getCompletionsService();
    const context = html``;
    const position = {
      line: 0,
      character: 0,
    };
    const typeAndParam = getCompletionType(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toHaveLength(0);
  });

  it("Returns completions for the custom element tags if inside of an opening tag", () => {
    const service = getCompletionsService();
    const context = html`<`;
    const position = {
      line: 0,
      character: 1,
    };
    const typeAndParam = getCompletionType(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
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
    const position = {
      line: 0,
      character: 13,
    };
    const typeAndParam = getCompletionType(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
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
    const position = {
      line: 0,
      character: 16,
    };
    const typeAndParam = getCompletionType(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'colour=""',
        kind: "parameter",
        kindModifiers: "custom-element-attribute",
        labelDetails: {
          description: "[attr] CustomElement",
          detail: " string",
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
          detail: " boolean",
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
    const position = {
      line: 0,
      character: 19,
    };
    const typeAndParam = getCompletionType(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'colour=""',
        kind: "parameter",
        kindModifiers: "custom-element-attribute",
        labelDetails: {
          description: "[attr] CustomElement",
          detail: " string",
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
          detail: " boolean",
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
    const position = {
      line: 0,
      character: 28,
    };
    const typeAndParam = getCompletionType(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([
      {
        insertText: 'colour=""',
        kind: "parameter",
        kindModifiers: "custom-element-attribute",
        labelDetails: {
          description: "[attr] CustomElement",
          detail: " string",
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
          detail: " boolean",
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
    const position = {
      line: 0,
      character: 28,
    };
    const typeAndParam = getCompletionType(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
    });

    expect(completions.entries).toEqual([...globalDataAttributeAssersions]);
  });

  it("Returns name completions when we try and complete attributes on an unknown custom element", () => {
    const service = getCompletionsService();
    const context = html`<unknown-element `;
    const position = {
      line: 0,
      character: 17,
    };
    const typeAndParam = getCompletionType(context, position);

    const completions = service.getCompletionsAtPosition(baseCompletionInfo, {
      context,
      position,
      typeAndParam,
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
