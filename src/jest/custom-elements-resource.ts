import {
  CEInfo,
  CustomElementAttribute,
  CustomElementsService,
  GetCEInfo,
} from "../plugin/transformer/custom-elements-resource";

type StubbedManifest = {
  [key: string]: {
    attr: {
      name: string;
      type: string;
    }[];
  };
};

export const buildDefaultCEFake = (): CustomElementsResourceFake => {
  return new CustomElementsResourceFake({
    "custom-element": {
      attr: [
        { name: "colour", type: "string" },
        { name: "activated", type: "boolean" },
      ],
    },
    "no-attr": {
      attr: [],
    },
  });
};

/**
 * Implements `CustomElementsResource` so can be used as a custom elements resource
 * as a fake/stub during unit tests
 */
export class CustomElementsResourceFake implements CustomElementsService {
  constructor(private manifest: StubbedManifest) { }

  getCEAttributes(name: string): CustomElementAttribute[] {
    const definition = this.manifest[name];
    if (!definition || !definition.attr) return [];

    return definition.attr.map((a) => ({
      name: a.name,
      type: a.type,
    }));
  }

  getCENames(): string[] {
    return [...Object.keys(this.manifest)];
  }

  getCEInfo(config: GetCEInfo): CEInfo[] {
    return [];
  }
}
