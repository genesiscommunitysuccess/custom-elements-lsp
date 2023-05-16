import { CustomElementDef } from "../plugin/custom-elements/custom-elements.types";
import { Package } from "custom-elements-manifest";
import { readFileSync, existsSync } from "fs";
import { getLogger } from "./utils";
import {
  CEMTConfig,
  CustomElementsAnalyzerManifestParser,
} from "../plugin/custom-elements/repository";
import { CustomElementsServiceImpl } from "../plugin/custom-elements/service";

const MANIFSST_PATH = "./src/jest/ce-test.json";

let manifest: string;

/**
 * Builds a stubbed `CustomElementsResource` and constructs a `CustomElementsServiceImpl`.
 */
export const getCEServiceFromStubbedResource = () => {
  const resource = {
    data: new Map<string, CustomElementDef>(),
  };

  resource.data.set("custom-element", {
    name: "CustomElement",
    kind: "class",
    path: "src/components/avatar/avatar.ts",
    customElement: true,
    attributes: [
      { name: "colour", type: { text: "string" } },
      { name: "activated", type: { text: "boolean" } },
    ],
  });

  resource.data.set("no-attr", {
    name: "NoAttribute",
    kind: "class",
    path: "src/components/misc/no-attr.ts",
    customElement: true,
    attributes: [],
  });

  return new CustomElementsServiceImpl(getLogger(), resource);
};

/**
 * Builds a real `CustomElementsAnalyzerManifestParser` from the test manifest
 * located at `MANIFSST_PATH`, and constructs a `CustomElementsServiceImpl` using
 * it as the resource.
 */
export function getCEServiceFromTestJsonResource(
  configOverride: Partial<CEMTConfig>
) {
  if (!manifest) {
    if (!existsSync(MANIFSST_PATH)) {
      console.error(
        `ERROR: tests require manifest from /example application to exists.`
      );
      console.error(
        `ERROR: to generate manifest go into the 'example' directory and run 'npm run lsp:analyse'`
      );
      process.exit(1);
    }
    manifest = readFileSync(MANIFSST_PATH, "utf8");
    manifest = JSON.parse(manifest);
  }

  const logger = getLogger();

  return new CustomElementsServiceImpl(
    logger,
    new CustomElementsAnalyzerManifestParser(
      logger,
      manifest as unknown as Package,
      {
        designSystemPrefix: "example",
        ...configOverride,
      }
    )
  );
}
