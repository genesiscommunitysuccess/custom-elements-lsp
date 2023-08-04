#!/usr/bin/env node

/**
 * This script instantiates the manifest repository and outputs the manifest to `ce.json` file. This allows you to test
 * out the glob paths and check the output that the LSP would be
 * seeing, which is useful if you're not receiving the results
 * in the LSP that you expect.
 */

import minimist from 'minimist-lite';
import { readFileSync, writeFileSync } from 'fs';
import {
  LiveUpdatingCEManifestRepository,
  mixinParserConfigDefaults,
} from '../../out/plugin/custom-elements/manifest/repository.js';

const OUT_FILE = 'ce.json';

const args = minimist(process.argv.slice(2));
console.log(`args: ${JSON.stringify(args)}`);

const logger = {
  log: (msg) => console.log(`[log] ${msg}`),
};

const config = mixinParserConfigDefaults({
  timeout: 1000,
  src: args.src ?? 'src/**/*.{js,ts}',
  dependencies: JSON.parse(args.dependencies ?? '[]'),
});

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
