import { TemplateContext } from "typescript-template-language-service-decorator";
import { LineAndCharacter, TextSpan } from "typescript/lib/tsserverlibrary";
import { html } from "../../jest/utils";
import {
  getWholeTextReplcaementSpan,
  replaceTemplateStringBinding,
} from "./strings";

describe("replaceTemplateStringBinding", () => {
  const testCases: [string, [string], string][] = [
    ["Empty string", [""], ""],
    [
      "Returns input string if it doesn't contain any template bindings",
      ["test ${}"],
      "test ${}",
    ],
    [
      "Returns input string the template binding is empty",
      ["test=${}"],
      "test=${}",
    ],
    [
      "Replaces template binding content with 'y' of the same length",
      ["test=\"${_ => 'hello'}\""],
      'test="${yyyyyyyyyyyy}"',
    ],
    [
      "Replaces multiple template bindings",
      ["test=\"${_ => 'hello'}\" test=\"${_ => 'hello'}\""],
      'test="${yyyyyyyyyyyy}" test="${yyyyyyyyyyyy}"',
    ],
  ];

  for (const [name, [input], expected] of testCases) {
    it(name, () => {
      expect(replaceTemplateStringBinding(input)).toEqual(expected);
    });
  }
});

describe("getWholeTextReplcaementSpan", () => {
  const testCases: [string, [LineAndCharacter, TemplateContext], TextSpan][] = [
    [
      "Returns the span of a string with the cursor in it",
      [{ line: 0, character: 4 }, html` test`],
      { start: 1, length: 3 },
    ],
    [
      "Returns the span of a string that contains a symbol character @",
      [{ line: 0, character: 5 }, html` @test`],
      { start: 1, length: 4 },
    ],
    [
      "Returns the span of a string that contains a symbol character ?",
      [{ line: 0, character: 2 }, html` ?test`],
      { start: 1, length: 1 },
    ],
    [
      "Returns the span of a string that contains a symbol character :",
      [{ line: 0, character: 5 }, html` :test`],
      { start: 1, length: 4 },
    ],
    [
      "Returns the span of a string accounting for a white space boundary",
      [{ line: 0, character: 8 }, html` test again`],
      { start: 6, length: 2 },
    ],
    [
      "Returns the starting at index 0 if there is no white space preceding the cursor",
      [{ line: 0, character: 8 }, html`testagain`],
      { start: 0, length: 8 },
    ],
  ];

  for (const [name, [position, context], expected] of testCases) {
    it("Happy path: " + name, () => {
      debugger;
      expect(getWholeTextReplcaementSpan(position, context)).toEqual(expected);
    });
  }

  const unhappyCases: [string, [LineAndCharacter, TemplateContext], string][] =
    [
      [
        "Index out of bounds if position isn't in context",
        [{ line: 0, character: 500 }, html` test`],
        "Span out of bounds in context.text",
      ],
    ];

  for (const [name, [position, context], expected] of unhappyCases) {
    it("Unhappy path: " + name, () => {
      let e;
      try {
        debugger;
        const res = getWholeTextReplcaementSpan(position, context);
        console.log(res);
      } catch (error) {
        e = error;
      }
      expect((e as any).message).toEqual(expected);
    });
  }
});