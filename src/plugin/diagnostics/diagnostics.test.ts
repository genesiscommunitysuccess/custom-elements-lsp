import { TemplateContext } from "typescript-template-language-service-decorator";
import { buildDefaultCEFake } from "../../jest/custom-elements-resource";
import { getLogger, html } from "../../jest/utils";
import { CustomElementsResource } from "../transformer/custom-elements-resource";
import { DiagnosticsService } from "./diagnostics";

const getDiagnosticsService = (ce: CustomElementsResource) =>
  new DiagnosticsService(getLogger(), ce);

describe("getPositionOfNthTagEnd", () => {
  const tests: [string, [TemplateContext, string, number], any][] = [
    ["-1 for empty string", [html``, "a", 0], -1],
  ];

  for (const [name, [context, tagName, occurance], expected] of tests) {
    const service = getDiagnosticsService(buildDefaultCEFake());
    it(`getPositionOfNthTagEnd : ${name}`, () => {
      // Need to use `as any` because the function is private. `
      const result = (service as any).getPositionOfNthTagEnd(
        context,
        tagName,
        occurance
      );
      expect(result).toEqual(expected);
    });
  }
});
