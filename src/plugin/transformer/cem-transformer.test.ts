import { getCEFromTestJson } from "../../jest/utils";

describe("getCENames", () => {
  it("Returns the names of the custom elements from the manifest", () => {
    const ceResource = getCEFromTestJson();
    const res = ceResource.getCENames();
    expect(res).toEqual([
      "root-component",
      "person-avatar",
      "%%prefix%%-button",
      "theme-picker",
    ]);
  });

  // Test work if the compose export isn't in the same file
});
