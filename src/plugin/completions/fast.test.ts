import {
  CompletionEntry,
  CompletionInfo,
  ScriptElementKind,
  TextSpan,
} from "typescript/lib/tsserverlibrary";
import { getCEServiceFromStubbedResource } from "../../jest/custom-elements";
import { getGDServiceFromStubbedResource } from "../../jest/global-data";
import { buildServices, getLogger, html } from "../../jest/utils";
import { CustomElementsService } from "../custom-elements/custom-elements.types";
import { GlobalDataService } from "../global-data/global-data.types";
import { CompletionCtx } from "./completions.types";
import { FASTCompletionsService } from "./fast";

const getFASTCompletionsService = (
  ceRes: CustomElementsService = getCEServiceFromStubbedResource(),
  gdRes: GlobalDataService = getGDServiceFromStubbedResource()
) =>
  new FASTCompletionsService(
    getLogger(),
    buildServices({ customElements: ceRes, globalData: gdRes })
  );

describe("convertFastEventAttributes", () => {
  const baseEntries: CompletionEntry[] = [
    {
      name: "test",
      kind: ScriptElementKind.unknown,
      sortText: "",
    },
    {
      name: "test-again",
      kind: ScriptElementKind.unknown,
      sortText: "",
      kindModifiers: "hi",
    },
  ];

  it("Doesn't change any non 'event-attribute' completions", () => {
    const entries: CompletionEntry[] = [...baseEntries];
    const replacementSpan: TextSpan = { start: 0, length: 2 };

    const service = getFASTCompletionsService();
    const res = (service as any).convertFastEventAttributes(
      entries,
      replacementSpan
    );
    expect(res).toEqual(entries);
  });

  it("Changes only 'event-attribute' completions to the FAST binding snippet", () => {
    const entries: CompletionEntry[] = [
      ...baseEntries,
      {
        name: "onclick",
        kind: ScriptElementKind.unknown,
        sortText: "",
        kindModifiers: "event-attribute",
      },
    ];
    const replacementSpan: TextSpan = { start: 0, length: 2 };

    const service = getFASTCompletionsService();
    const res = (service as any).convertFastEventAttributes(
      entries,
      replacementSpan
    );
    expect(res).toEqual([
      ...baseEntries,
      {
        isSnippet: true,
        kind: "",
        kindModifiers: "event-attribute",
        name: "@click",
        replacementSpan: {
          length: 2,
          start: 0,
        },
        sortText: "",
      },
    ]);
  });

  it("Updates the insert text to a snippet if set as inserting empty quotes", () => {
    const entries: CompletionEntry[] = [
      ...baseEntries,
      {
        name: "onclick",
        insertText: 'onclick=""',
        kind: ScriptElementKind.unknown,
        sortText: "",
        kindModifiers: "event-attribute",
      },
    ];
    const replacementSpan: TextSpan = { start: 0, length: 2 };

    const service = getFASTCompletionsService();
    const res = (service as any).convertFastEventAttributes(
      entries,
      replacementSpan
    );
    expect(res).toEqual([
      ...baseEntries,
      {
        insertText: '@click="${(x,c) => $1}"$0',
        isSnippet: true,
        kind: "",
        kindModifiers: "event-attribute",
        name: "@click",
        replacementSpan: {
          length: 2,
          start: 0,
        },
        sortText: "",
      },
    ]);
  });
});

describe("addElementEventCompletions", () => {
  it("Doesn't return any completions if the custom element doesn't have any events", () => {
    const service = getFASTCompletionsService();
    const replacementSpan: TextSpan = { start: 0, length: 2 };
    const res = (service as any).addElementEventCompletions(
      replacementSpan,
      "no-attr"
    );
    expect(res.length).toBe(0);
  });

  it("Doesn't return any completions if the custom element doesn't have any events", () => {
    const service = getFASTCompletionsService();
    const replacementSpan: TextSpan = { start: 0, length: 2 };
    const res = (service as any).addElementEventCompletions(
      replacementSpan,
      "custom-element"
    );
    expect(res).toEqual([
      {
        insertText: '@event="${(x, c) => $1}"$0',
        isSnippet: true,
        kind: "parameter",
        kindModifiers: "custom-element-event",
        labelDetails: {
          description: "[attr] CustomElement",
        },
        name: "@event",
        replacementSpan: {
          length: 2,
          start: 0,
        },
        sortText: "f",
      },
      {
        insertText: '@inherited="${(x, c) => $1}"$0',
        isSnippet: true,
        kind: "parameter",
        kindModifiers: "custom-element-event",
        labelDetails: {
          description: "[attr] ParentElement",
        },
        name: "@inherited",
        replacementSpan: {
          length: 2,
          start: 0,
        },
        sortText: "f",
      },
    ]);
  });
});

describe("getCompletionsAtPosition", () => {
  const baseCompletionInfo: CompletionInfo = {
    entries: [],
    isGlobalCompletion: false,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
  };

  it("Returns the CompletionInfo unaltered if the completion context is not attribute", () => {
    const service = getFASTCompletionsService();
    const ctx: CompletionCtx = {
      position: { line: 0, character: 0 },
      context: html``,
      typeAndParam: { key: "none", params: undefined },
    };

    const res = service.getCompletionsAtPosition(baseCompletionInfo, ctx);
    expect(res).toEqual(baseCompletionInfo);
  });

  it("Returns the CompletionInfo with updated events to match fast and element events added", () => {
    const service = getFASTCompletionsService();
    const ctx: CompletionCtx = {
      position: { line: 0, character: 2 },
      context: html`<custom-elem hi=`,
      typeAndParam: {
        key: "custom-element-attribute",
        params: "custom-element",
      },
    };
    const completionInfo: CompletionInfo = {
      ...baseCompletionInfo,
      entries: [
        {
          name: "onclick",
          insertText: 'onclick=""',
          kind: ScriptElementKind.unknown,
          sortText: "",
          kindModifiers: "event-attribute",
        },
      ],
    };

    const res = service.getCompletionsAtPosition(completionInfo, ctx);
    expect(res).toEqual({
      ...baseCompletionInfo,
      entries: [
        {
          insertText: '@click="${(x,c) => $1}"$0',
          isSnippet: true,
          kind: "",
          kindModifiers: "event-attribute",
          name: "@click",
          replacementSpan: {
            length: 2,
            start: 0,
          },
          sortText: "",
        },
        {
          insertText: '@event="${(x, c) => $1}"$0',
          isSnippet: true,
          kind: "parameter",
          kindModifiers: "custom-element-event",
          labelDetails: {
            description: "[attr] CustomElement",
          },
          name: "@event",
          replacementSpan: {
            length: 2,
            start: 0,
          },
          sortText: "f",
        },
        {
          insertText: '@inherited="${(x, c) => $1}"$0',
          isSnippet: true,
          kind: "parameter",
          kindModifiers: "custom-element-event",
          labelDetails: {
            description: "[attr] ParentElement",
          },
          name: "@inherited",
          replacementSpan: {
            length: 2,
            start: 0,
          },
          sortText: "f",
        },
      ],
    });
  });
});
