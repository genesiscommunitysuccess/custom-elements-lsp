import { getLogger } from "../../jest/utils";
import { getStore } from "./kvstore";

describe("kvstore", () => {
  it("getStore returns a singleton", () => {
    const logger = getLogger();
    const r1 = getStore(logger);
    const r2 = getStore(logger);
    expect(r1).toBe(r2);
  });


  // unsafeGetOrAdd will test getOrAdd as well
  describe("(TSUnsafe)GetOrAdd", () => {
    it('Generates the value the first time it is required, and then uses the cache subsequent times', () => {
      const fn = jest.fn().mockReturnValue("test");
      const logger = getLogger();
      const kvStore = getStore(logger);

      const res1 = kvStore.TSUnsafeGetOrAdd("test", fn);
      const res2 = kvStore.TSUnsafeGetOrAdd("test", fn);

      expect(res1).toBe(res2);
      expect(fn).toHaveBeenCalledTimes(1);
    })
  });
});
