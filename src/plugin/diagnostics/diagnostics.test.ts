import { TemplateContext } from "typescript-template-language-service-decorator";
import { buildDefaultCEFake } from "../../jest/custom-elements-resource";
import { getLogger, html } from "../../jest/utils";
import { CustomElementsResource } from "../transformer/custom-elements-resource";
import { DiagnosticsService } from "./diagnostics";

const getDiagnosticsService = (ce: CustomElementsResource) =>
  new DiagnosticsService(getLogger(), ce);

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
    it(`getPositionOfNthTagEnd : ${name}`, () => {
      // Need to use `as any` because the function is private. `
      const result = (service as any).getPositionOfNthTagEnd({
        context,
        tagName,
        occurrence,
      });
      expect(result).toEqual(expected);
    });
  }
});
