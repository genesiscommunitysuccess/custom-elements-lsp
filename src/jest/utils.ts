import { Package } from "custom-elements-manifest";
import { readFileSync, existsSync } from "fs";
import { Logger } from "typescript-template-language-service-decorator";
import { CustomElementsManifestTransformer } from "../plugin/transformer/cem-transformer";

const MANIFSST_PATH = "./src/jest/ce-test.json";

let manifest: string | undefined = undefined;

const constructLogger = (debugLog: boolean = false): Logger => ({
  log: (msg: string) => {
    debugLog && console.log(`[debug-log] ${msg}`);
  },
});

export function getCEManifest() {
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

export function getLogger() {
  const debugLog = process.env.TEST_LOG === "1";
  return constructLogger(debugLog);
}
