import importAliasPlugin, { ImportAliasPluginOptions } from '../src';
import fs from 'fs';
import ts from 'typescript';
import { getAnalyzerCreateHarness } from './analyzer-create';

const buildTestCase = async (config: ImportAliasPluginOptions) => {
  const baseFilePath = '/fixtures/default/sourcecode/default.js';
  const parentFilePath = '/fixtures/default/sourcecode/superclass.js';

  const defaultCode = fs.readFileSync(process.cwd() + baseFilePath).toString();
  const superclassCode = fs.readFileSync(process.cwd() + parentFilePath).toString();

  const modules = [
    ts.createSourceFile(baseFilePath, defaultCode, ts.ScriptTarget.ES2021, true),
    ts.createSourceFile(parentFilePath, superclassCode, ts.ScriptTarget.ES2021, true),
  ];

  return (await getAnalyzerCreateHarness())({ modules, plugins: [importAliasPlugin(config)] });
};

describe('when using no parameters', () => {
  it('placeholder test', async () => {
    const res = await buildTestCase({});
    expect(res.modules[0]?.declarations?.[0]?.kind).toBe('class');
  });
});
