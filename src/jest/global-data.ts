import { GlobalDataRepository } from "../plugin/global-data/global-data.types";
import { GlobalDataServiceImpl } from "../plugin/global-data/service";
import { getLogger } from "./utils";

/**
 * Returns a real `GlobalDataServiceImpl` using a stubbed `GlobalDataRepository`
 * as the resource
 */
export const getGDServiceFromStubbedResource = () => {
  const resource: GlobalDataRepository = {
    getAttributes() {
      return [
        ["data-*", "wildcard"],
        ["class", "string"],
        ["autofocus", "boolean"],
      ];
    },
    getAriaAttributes() {
      return ["aria-label"];
    },
    getEvents() {
      return ["onclick"];
    },
  };

  return new GlobalDataServiceImpl(getLogger(), resource);
};
