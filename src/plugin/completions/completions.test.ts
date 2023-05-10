import { buildDefaultCEFake } from "../../jest/custom-elements-resource";
import { getLogger, html } from "../../jest/utils";
import { CustomElementsResource } from "../transformer/custom-elements-resource";
import { CompletionsService } from "./completions";

const getCompletionsService = (ceRes: CustomElementsResource) =>
  new CompletionsService(getLogger(), ceRes);

describe("getCompletionType", () => {
  it('Returns "none" if we are in a blank template', () => {
    const service = getCompletionsService(buildDefaultCEFake());
    const context = html``;

    // `getComptionType` is private so need to case to `any` to test it
    const result = (service as any).getComptionType(context, {
      line: 0,
      character: 0,
    });
    expect(result).toEqual({ key: "none", params: undefined });
  });
});

describe("getCompletionsAtPosition", () => {
  it("Returns no completions if we are in a blank template", () => {
    const service = getCompletionsService(buildDefaultCEFake());
    const context = html``;

    const completions = service.getCompletionsAtPosition(context, {
      line: 0,
      character: 0,
    });

    expect(completions.entries).toHaveLength(0);
  });

  it("Returns completions for the custom element tags if inside of an opening tag", () => {
    const service = getCompletionsService(buildDefaultCEFake());
    const context = html`<`;

    const completions = service.getCompletionsAtPosition(context, {
      line: 0,
      character: 1,
    });

    expect(completions.entries).toEqual([
      {
        insertText: "<custom-element></custom-element>",
        kind: "type",
        kindModifiers: "custom-element",
        name: "custom-element",
        sortText: "custom-element",
      },
      {
        insertText: "<no-attr></no-attr>",
        kind: "type",
        kindModifiers: "custom-element",
        name: "no-attr",
        sortText: "custom-element",
      },
    ]);
  });
});
