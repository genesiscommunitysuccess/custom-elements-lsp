import { Package } from "custom-elements-manifest";
import { readFileSync, existsSync } from "fs";
import {
  Logger,
  TemplateContext,
} from "typescript-template-language-service-decorator";
import {
  CEMTConfig,
  CustomElementsAnalyzerManifestParser,
} from "../plugin/custom-elements/repository";
import { CustomElementsServiceImpl } from "../plugin/custom-elements/service";

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
export function getCEFromTestJson(configOverride: Partial<CEMTConfig>) {
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

/**
 * Construct a logger which will output debug logs if the `TEST_LOG` environment
 * variable is set to `1`. Use via `npm run test:unit:verbose`.
 */
export function getLogger() {
  const debugLog = process.env.TEST_LOG === "1";
  return constructLogger(debugLog);
}

const toOffset =
  (rawText: string) =>
    ({ line, character }: { line: number; character: number }) =>
      rawText
        .split(/\n/g)
        .slice(0, line)
        .reduce((acc, curr) => acc + curr.length + 1, 0) + character;

/**
 * Tagged template literal which is converted to TemplateContext
 * for use in the unit tests
 */
export const html = (
  strings: TemplateStringsArray,
  ...values: ((...args: any[]) => any)[]
): TemplateContext => {
  const rawText = String.raw({ raw: strings }, ...values) ?? "";

  return {
    typescript: jest.fn() as any,
    fileName: "test.ts",
    text:
      String.raw(
        { raw: strings },
        ...values.map((v) => "x".repeat(v.toString().length))
      ) ?? "",
    rawText,
    node: {
      getSourceFile: () => "test.ts",
    } as any,
    toOffset: toOffset(rawText),
    toPosition: jest.fn(),
  };
};

export function expectArrayElements(expected: any[], actual: any[]): void {
  expect(expected.sort()).toEqual(actual.sort());
}
