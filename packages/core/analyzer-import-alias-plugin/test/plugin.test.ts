import importAliasPlugin, { ImportAliasPluginOptions } from '../src';
import fs from 'fs';
import ts from 'typescript';
import { getAnalyzerCreateHarness } from './analyzer-create';

const buildTestCase = async (config: ImportAliasPluginOptions) => {
  const baseFilePath = '/test/fixtures/default/sourcecode/default.js';
  const parentFilePath = '/test/fixtures/default/sourcecode/superclass.js';

  const defaultCode = fs.readFileSync(process.cwd() + baseFilePath).toString();
  const superclassCode = fs.readFileSync(process.cwd() + parentFilePath).toString();

  const modules = [
    ts.createSourceFile(baseFilePath, defaultCode, ts.ScriptTarget.ES2021, true),
    ts.createSourceFile(parentFilePath, superclassCode, ts.ScriptTarget.ES2021, true),
  ];

  return (
    (await getAnalyzerCreateHarness())({ modules, plugins: [importAliasPlugin(config)] }), null, 2
  );
};

describe('when using no parameters', () => {
  it('blah', () => {
    expect(1).toBe(1);
  });

  it('test', async () => {
    expect(await buildTestCase({})).toBe(1);
  });
});
