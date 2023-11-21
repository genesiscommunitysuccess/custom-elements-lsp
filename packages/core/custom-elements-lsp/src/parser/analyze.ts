#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import nodepath from 'path';
import { getTsconfig } from 'get-tsconfig';
import minimist from 'minimist-lite';
import resolve from 'resolve/sync.js';
import {
  LiveUpdatingCEManifestRepository,
  mixinParserConfigDefaults,
} from '../main/custom-elements/manifest/repository.js';
import { PluginConfig } from '../main/plugins/plugins.types';
import { IOService } from '../main/utils/index.js';

const EXIT_CODES = {
  cant_resolve_typescript: 1,
  cant_find_tsconfig: 2,
  cant_get_parser_config: 3,
};

const OUT_FILE = 'ce.json';

(async () => {
  let typescriptResolution: string | undefined;
  try {
    typescriptResolution = resolve('typescript');
  } catch (e) {
    console.error(`Could not resolve typescript: ${(<any>e).message}`);
    process.exit(EXIT_CODES.cant_resolve_typescript);
  }

  const args = minimist(process.argv.slice(2));
  console.log(`args: ${JSON.stringify(args)}`);

  const tsconfigPath =
    args.tsconfig ??
    (() => {
      console.log(
        `Unable to get \`tsconfig\` path from args, falling back to \`process.cwd() = \`${process.cwd()}`,
      );
      return process.cwd();
    })();

  const tsConfig = getTsconfig(tsconfigPath);
  if (tsConfig === null) {
    console.error(`Could not find tsconfig at: "${tsconfigPath}"`);
    process.exit(EXIT_CODES.cant_find_tsconfig);
  }

  const lspPluginConfigOptions = tsConfig?.config?.compilerOptions?.plugins?.find(
    (plugin) => plugin.name === '@genesiscommunitysuccess/custom-elements-lsp',
  ) as PluginConfig | undefined;

  if (!lspPluginConfigOptions?.parser) {
    console.error(`Cannot get parser config from tsconfig found at: "${tsconfigPath}"`);
    process.exit(EXIT_CODES.cant_get_parser_config);
  }

  const config = mixinParserConfigDefaults({
    ...lspPluginConfigOptions.parser,
  });

  const logger = {
    log: (msg: string) => console.log(`[log] ${msg}`),
  };

  const io: IOService = {
    readFile: (path: string) => {
      return readFileSync(path, 'utf8');
    },
    getNormalisedRootPath: () =>
      nodepath.normalize(
        nodepath.dirname(typescriptResolution!) +
          '/' +
          lspPluginConfigOptions.srcRouteFromTSServer +
          '/',
      ),
    fileExists: (_: string): boolean => {
      throw new Error('Not implemented');
    },
    getLocationOfStringInFile: (_, __) => {
      throw new Error('Not implemented');
    },
  };

  const manifestRepo = new LiveUpdatingCEManifestRepository(logger, io, config);
  // @ts-expect-error
  await manifestRepo.analyzeAndUpdate();

  writeFileSync(OUT_FILE, JSON.stringify(manifestRepo.manifest, null, 2));

  // Exit manually as manifestRepo is using chockidar watch
  process.exit(0);
})();
