import { expectArrayElements, getCEFromTestJson } from "../../jest/utils";

describe("getCENames", () => {
  it("Returns the names of the custom elements from the manifest", () => {
    const ceResource = getCEFromTestJson({ designSystemPrefix: undefined });
    const res = ceResource.getCENames();
    expectArrayElements(res, [
      "root-component",
      "person-avatar",
      "%%prefix%%-button",
      "theme-picker",
    ]);
  });

  it("Returns the names of the custom elements from the manifest, with the prefix replaced if the design system prefix is set", () => {
    const ceResource = getCEFromTestJson({});
    const res = ceResource.getCENames();
    expectArrayElements(res, [
      "root-component",
      "person-avatar",
      "example-button",
      "theme-picker",
    ]);
  });
});

describe("getCEAttributes", () => {
  const tests: [string, [string], any][] = [
    ["Unknown element returns an empty array", ["invalid-ce"], []],
    [
      "Element returns its attribute",
      ["example-button"],
      [
        {
          name: "title",
          type: "string",
        },
      ],
    ],
    [
      "Element returns its attributes with correct type and name if the attribute does not match the variable name",
      ["person-avatar"],
      [
        {
          name: "avatar-src",
          type: "string",
        },
        {
          name: "fullInfoDisabled",
          type: "boolean",
        },
      ],
    ],
  ];

  for (const [name, [tagName], expected] of tests) {
    const ceResource = getCEFromTestJson({});
    it(name, () => {
      const res = ceResource.getCEAttributes(tagName);
      expect(res).toEqual(expected);
    });
  }
});

describe("processPath", () => {
  const tests: [string, [string, boolean], string][] = [
    [
      "Returns the input if getFullPath is true",
      ["Input string", true],
      "Input string",
    ],
    [
      "Returns the input including node_modules/@scope if getFullPath is true",
      ["node_modules/@scope/pkg/index.ts", true],
      "node_modules/@scope/pkg/index.ts",
    ],
    [
      "Returns the entire path if a local file, if getFullpath is false",
      ["pkg/index.ts", false],
      "pkg/index.ts",
    ],
    [
      "Returns the package if a library file, if getFullpath is false, and the package is not scoped",
      ["node_modules/pkg/index.ts", false],
      "pkg",
    ],
    [
      "Returns the scoped package if a library file, if getFullpath is false, and the package is scoped",
      ["node_modules/@scope/pkg/index.ts", false],
      "@scope/pkg",
    ],
  ];

  for (const [name, [path, getFullpath], expected] of tests) {
    const ceResource = getCEFromTestJson({});
    it(name, () => {
      const res = (ceResource as any).processPath(path, getFullpath);
      expect(res).toEqual(expected);
    });
  }
});
