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

require('../../out/parser/analyze');
