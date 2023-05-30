import { replaceTemplateStringBinding } from "./strings";

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
