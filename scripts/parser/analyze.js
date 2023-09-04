#!/usr/bin/env node

/**
 * This script instantiates the manifest repository and outputs the manifest to `ce.json` file. This allows you to test
 * out the glob paths and check the output that the LSP would be
 * seeing, which is useful if you're not receiving the results
 * in the LSP that you expect.
 *
 * The script currently takes an optional argument:
 * - `--tsconfig` - the path to the tsconfig.json file to use. Defaults to `process.cwd()`.
 * - `--fastEnable` is set from the plugin config.
 */

import { readFileSync, writeFileSync } from 'fs';
import { getTsconfig } from 'get-tsconfig';
import minimist from 'minimist-lite';
import resolve from 'resolve/sync.js';
import nodepath from 'path';
import {
  LiveUpdatingCEManifestRepository,
  mixinParserConfigDefaults,
} from '../../out/plugin/custom-elements/manifest/repository.js';

const OUT_FILE = 'ce.json';

let typescriptResolution;
try {
  typescriptResolution = resolve('typescript');
} catch (e) {
  console.error(`Could not resolve typescript: ${e.message}`);
  process.exit(1);
}

const args = minimist(process.argv.slice(2));
console.log(`args: ${JSON.stringify(args)}`);

const tsconfigPath =
  args.tsconfig ??
  (() => {
    console.log(
      `Unable to get \`tsconfig\` path from args, falling back to \`process.cwd() = \`${process.cwd()}`
    );
    return process.cwd();
  })();

const tsConfig = getTsconfig(tsconfigPath);
if (tsConfig === null) {
  console.error(`Could not find tsconfig at: "${tsconfigPath}"`);
  process.exit(2);
}

const lspPluginConfigOptions = tsConfig?.config?.compilerOptions?.plugins?.find(
  (plugin) => plugin.name === '@genesiscommunitysuccess/custom-elements-lsp'
);

if (!lspPluginConfigOptions?.parser) {
  console.error(`Cannot get parser config from tsconfig found at: "${tsconfigPath}"`);
  process.exit(3);
}

const config = mixinParserConfigDefaults({
  ...lspPluginConfigOptions.parser,
});

const logger = {
  log: (msg) => console.log(`[log] ${msg}`),
};

const io = {
  readFile: (path) => {
    return readFileSync(path, 'utf8');
  },
  getNormalisedRootPath: () =>
    nodepath.normalize(
      nodepath.dirname(typescriptResolution) +
        '/' +
        lspPluginConfigOptions.srcRouteFromTSServer +
        '/'
    ),
};

const manifestRepo = new LiveUpdatingCEManifestRepository(
  logger,
  io,
  config,
  !!lspPluginConfigOptions?.fastEnable
);
await manifestRepo.analyzeAndUpdate();

writeFileSync(OUT_FILE, JSON.stringify(manifestRepo.manifest, null, 2));

// Exit manually as manifestRepo is using chockidar watch
process.exit(0);
