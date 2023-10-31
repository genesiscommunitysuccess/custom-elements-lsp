import fs from 'fs';
import { Plugin } from '@custom-elements-manifest/analyzer';
import type { ClassMember } from 'custom-elements-manifest';
import ts from 'typescript';
import importAliasPlugin, { ImportAliasPluginOptions } from '../src';
import { getAnalyzerCreateHarness } from './analyzer-create';
import { baseCase } from './fixtures/default/unittest';

/**
 * Sets of tests for the complete flow of the plugin.
 */

const buildTestCase = async (
  config: ImportAliasPluginOptions,
  _phaseOverrides: Partial<Plugin> = {},
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

const getCorrectTestAssersion = () => {
  const MISSNG_INHERITED_PROPERTY: ClassMember = {
    default: "'bar'",
    inheritedFrom: {
      module: 'super-class.js',
      name: 'MyElement',
    },
    kind: 'field',
    name: 'foo',
    type: {
      text: 'string',
    },
  };

  const expected = structuredClone(baseCase);
  expected.modules.forEach(
    (module) =>
      module.declarations?.forEach(
        (declaration) =>
          declaration.kind === 'class' &&
          declaration.name !== 'AnotherElement' &&
          declaration?.members?.push(MISSNG_INHERITED_PROPERTY),
      ),
  );
  return expected;
};

describe('when using no parameters', () => {
  it('produces the base-case manifest where the superclass is ignored', async () => {
    const res = await buildTestCase({});
    expect(res).toEqual(baseCase);
  });
});

describe('when transforming an import not matching any import', () => {
  it('produces the base-case manifest where the superclass is ignored', async () => {
    const res = await buildTestCase({ noMatch: {} });
    expect(res).toEqual(baseCase);
  });
});

describe('when transforming an import not matching any override setting', () => {
  it('produces the base-case manifest where the superclass is ignored', async () => {
    const res = await buildTestCase({ ['my-library']: { override: { noMatch: 'null' } } });
    expect(res).toEqual(baseCase);
  });
});

describe('when transforming an import using a specific override to allow it to reference the superclass manifest', () => {
  it('the produced manifest has the correct inherited information', async () => {
    const res = await buildTestCase({
      ['my-library']: { override: { ParentElement: 'MyElement' } },
    });
    expect(res).toEqual(getCorrectTestAssersion());
  });
});

describe('when transforming an import using a transformer function, to allow it to reference the superclass manifest', () => {
  it('the produced manifest has the correct inherited information', async () => {
    const res = await buildTestCase({
      ['my-library']: { '*': (name) => name.replace('Parent', 'My') },
    });
    expect(res).toEqual(getCorrectTestAssersion());
  });
});

describe('config override takes precedent over the transformer function', () => {
  it('the produced manifest has the correct inherited information', async () => {
    const res = await buildTestCase({
      ['my-library']: {
        override: { ParentElement: 'MyElement' },
        '*': (name) => name.replace('Parent', 'Base'),
      },
    });
    expect(res).toEqual(getCorrectTestAssersion());
  });
});
