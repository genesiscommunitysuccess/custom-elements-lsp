#!/usr/bin/env node

// TODO: Handle --watch

import { readFileSync, writeFileSync, renameSync } from 'fs';
import path from 'path';
import { cli } from '@custom-elements-manifest/analyzer/cli.js';
import { globby } from 'globby';
import minimist from 'minimist-lite';

const IN_FILE = 'custom-elements.json';
const OUT_FILE = 'ce.json';

const args = minimist(process.argv.slice(2));

if (!args.src) {
  console.error('Missing --src argument');
  process.exit(1);
}

const analyseArgs = [
  'analyze',
  '--outdir',
  '.',
  '--fast', // TODO: don't hard code this if we ever want to be generic
  '--globs',
  args.src,
];

if (args.dependencies) {
  analyseArgs.push('--dependencies');
}

// https://custom-elements-manifest.open-wc.org/analyzer/config/
// TODO: Allow to set some variables from the node api
await cli({
  argv: analyseArgs,
});

if (!args.lib) {
  renameSync(IN_FILE, OUT_FILE);
  console.log('customelments-analyse written to ' + OUT_FILE);
  process.exit(0);
}

// Fuse lib files into the manifest

// TODO: Nee to remove custom-elements.json too

const libFiles = await globby(args.lib, { cwd: process.cwd() });

const manifest = JSON.parse(readFileSync(IN_FILE, 'utf8'));

for (const libFile of libFiles) {
  const libDir = path.dirname(libFile);
  const lib = JSON.parse(readFileSync(libFile, 'utf8'));

  lib.modules.forEach((mod) => {
    mod.path = path.join(libDir, mod.path);
    manifest.modules.push(mod);
  });
}

writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2));
console.log('customelments-analyse written to ' + OUT_FILE);
