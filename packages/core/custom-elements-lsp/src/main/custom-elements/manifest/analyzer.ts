import { Package } from 'custom-elements-manifest';

/**
 * This is a glue layer to import the ESM modules into the commonjs plugin.
 *
 * 1. A package such as the The analyzer is an ESM module.
 * 2. The plugin is a commonjs module, required to interface with tsserver.
 * 3. Using rollup to bundle the plugin, we can't work with cjs modules without using the cjs plugin.
 * 4. The cjs plugin doesn't work with chockkidar https://github.com/rollup/rollup/issues/3681
 * 5. We want to use dynamic import function to import the esm module in.
 * 6. `tsc` will transpile `import()` calls to `require()` calls for the tsconfig settings we need, which we do not want.
 * 7. We use an obfuscated call to the `import()` function via the function constructor to work around this.
 */
const dynamicImport = new Function('specifier', 'return import(specifier)');

export const getAnalyzerCLI = async () =>
  (await dynamicImport('@custom-elements-manifest/analyzer/cli.js')).cli as ({
    argv,
    cwd,
    noWrite,
  }: {
    argv?: string[];
    cwd?: string;
    noWrite?: boolean;
  }) => Promise<Package>;
export type AnalyzerCLI = Awaited<ReturnType<typeof getAnalyzerCLI>>;

export const getGlobby = async () =>
  (await dynamicImport('globby')).globby as (
    patterns: string | readonly string[],
    options?: any,
  ) => Promise<string[]>;
export type Globby = Awaited<ReturnType<typeof getGlobby>>;
