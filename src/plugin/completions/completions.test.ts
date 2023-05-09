import { getCEManifest } from "../../jest/utils";

describe("completions", () => {
  beforeAll(() => {
    console.log("mw - test beforeAll");
    getCEManifest();
  });
  it("passes", () => {
    expect(true).toBe(true);
  });
});
