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
