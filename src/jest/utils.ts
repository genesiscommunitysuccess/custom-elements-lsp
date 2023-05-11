import { Package } from "custom-elements-manifest";
import { readFileSync, existsSync } from "fs";
import {
  Logger,
  TemplateContext,
} from "typescript-template-language-service-decorator";
import { CustomElementsManifestTransformer } from "../plugin/transformer/cem-transformer";

const MANIFSST_PATH = "./src/jest/ce-test.json";

let manifest: string | undefined = undefined;

const constructLogger = (debugLog: boolean = false): Logger => ({
  log: (msg: string) => {
    debugLog && console.log(`[debug-log] ${msg}`);
  },
});

/**
 * Builds a real `CustomElementsManifestTransformer` from the test manifest
 * located at `MANIFSST_PATH`.
 */
export function getCEFromTestJson() {
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
  }
  manifest = JSON.parse(manifest);

  const logger = getLogger();

  return new CustomElementsManifestTransformer(
    logger,
    manifest as unknown as Package
  );
}

/**
 * Construct a logger which will output debug logs if the `TEST_LOG` environment
 * variable is set to `1`. Use via `npm run test:unit:verbose`.
 */
export function getLogger() {
  const debugLog = process.env.TEST_LOG === "1";
  return constructLogger(debugLog);
}

/**
 * Tagged template literal which is converted to TemplateContext
 * for use in the unit tests
 */
export const html = (
  strings: TemplateStringsArray,
  ...values: ((...args: any[]) => any)[]
): TemplateContext => {
  return {
    typescript: jest.fn() as any,
    fileName: "test.ts",
    text:
      String.raw(
        { raw: strings },
        ...values.map((v) => "x".repeat(v.toString().length))
      ) ?? "",
    rawText: String.raw({ raw: strings }, ...values) ?? "",
    node: jest.fn() as any,
    toOffset: jest.fn(),
    toPosition: jest.fn(),
  };
};
