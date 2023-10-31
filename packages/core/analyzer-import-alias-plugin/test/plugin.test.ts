import fs from 'fs';
import { Plugin } from '@custom-elements-manifest/analyzer';
import ts from 'typescript';
import importAliasPlugin, { ImportAliasPluginOptions } from '../src';
import { getAnalyzerCreateHarness } from './analyzer-create';
import { baseCase } from './fixtures/default/unittest';

/**
 * Sets of tests for the complete flow of the plugin.
 */

const buildTestCase = async (
  config: ImportAliasPluginOptions,
  phaseOverrides: Partial<Plugin> = {},
) => {
  const baseFilePath = '/test/fixtures/default/sourcecode/default.js';
  const anotherFilePath = '/test/fixtures/default/sourcecode/another.js';
  const superclassManifest = JSON.parse(
    fs.readFileSync(process.cwd() + '/test/fixtures/default/superclass.manifest.json').toString(),
  );

  const defaultCode = fs.readFileSync(process.cwd() + baseFilePath).toString();
  const superclassCode = fs.readFileSync(process.cwd() + anotherFilePath).toString();

  const modules = [
    ts.createSourceFile(baseFilePath, defaultCode, ts.ScriptTarget.ES2021, true),
    ts.createSourceFile(anotherFilePath, superclassCode, ts.ScriptTarget.ES2021, true),
  ];

  return (await getAnalyzerCreateHarness())({
    modules,
    plugins: [importAliasPlugin(config)],
    context: { thirdPartyCEMs: [superclassManifest] },
  });
};

describe('when using no parameters', () => {
  it('produces the base-case manifest where the superclass is ignored', async () => {
    const res = await buildTestCase({});
    expect(res).toEqual(baseCase);
  });
});

// describe('when transforming an import not matching any import', () => {
// it('produces the base-case manifest where the superclass is ignored', async () => {
// const res = await buildTestCase({ noMatch: {} });
// expect(res).toEqual(baseCase);
// });
// });
//
// describe('when transforming an import not matching any override setting', () => {
// it('produces the base-case manifest where the superclass is ignored', async () => {
// const res = await buildTestCase({ ['my-library']: { override: { noMatch: 'null' } } });
// expect(res).toEqual(baseCase);
// });
// });
//
// describe('when transforming an import using a specific override', () => {
// it('the matched override is changed and any child class is prepended with NAMESPACE_PREFIX', async () => {
// const res = await buildTestCase({
// ['my-library']: { override: { ParentElement: 'MyElement' } },
// });
// expect(res).toEqual(baseCase);
// });
// });
