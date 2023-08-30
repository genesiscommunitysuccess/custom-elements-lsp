#!/usr/bin/env node

/**
 * This script instantiates the manifest repository and outputs the manifest to `ce.json` file. This allows you to test
 * out the glob paths and check the output that the LSP would be
 * seeing, which is useful if you're not receiving the results
 * in the LSP that you expect.
 *
 * The script currently takes two optional arguments:
 * - `--tsconfig` - the path to the tsconfig.json file to use. Defaults to `process.cwd()`.
 * - `--fastEnabled` - whether to use the ms fast parsing mode of the manifest repository. Defaults to `false`.
 */

import { readFileSync, writeFileSync } from 'fs';
import { getTsconfig } from 'get-tsconfig';
import minimist from 'minimist-lite';
import {
  LiveUpdatingCEManifestRepository,
  mixinParserConfigDefaults,
} from '../../out/plugin/custom-elements/manifest/repository.js';

const OUT_FILE = 'ce.json';

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
  process.exit(1);
}

const lspPluginConfigOptions = tsConfig?.config?.compilerOptions?.plugins?.find(
  (plugin) => plugin.name === '@genesiscommunitysuccess/custom-elements-lsp'
)?.parser;

if (!lspPluginConfigOptions) {
  console.error(`Cannot get parser config from tsconfig found at: "${tsconfigPath}"`);
  process.exit(2);
}

const config = mixinParserConfigDefaults({
  ...lspPluginConfigOptions,
});

const logger = {
  log: (msg) => console.log(`[log] ${msg}`),
};

const io = {
  readFile: (path) => {
    return readFileSync(path, 'utf8');
  },
  getNormalisedRootPath: () => process.cwd() + '/',
};

const manifestRepo = new LiveUpdatingCEManifestRepository(logger, io, config, !!args.fastEnabled);
await manifestRepo.analyzeAndUpdate();

writeFileSync(OUT_FILE, JSON.stringify(manifestRepo.manifest, null, 2));

// Exit manually as manifestRepo is using chockidar watch
process.exit(0);
