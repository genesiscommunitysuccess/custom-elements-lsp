import { test } from 'uvu';
import * as assert from 'uvu/assert';
import path from 'path';
import fs from 'fs';
import globby from 'globby';
import ts from 'typescript';
import { create } from '@custom-elements-manifest/analyzer/src/create.js';
import myPlugin from '../index.js';

const fixturesDir = path.join(process.cwd(), 'fixtures');
let testCases = fs.readdirSync(fixturesDir);

testCases.forEach(testCase => {
  test(`Testcase ${testCase}`, async () => {

    const fixturePath = path.join(fixturesDir, `${testCase}/expected.json`);
    const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

    const packagePath = path.join(fixturesDir, `${testCase}/sourcecode`);
    const packagePathPosix = packagePath.split(path.sep).join(path.posix.sep);
    const outputPath = path.join(fixturesDir, `${testCase}/actual.json`);

    const globs = await globby(packagePathPosix);
    const modules = globs.map(glob => {
        const relativeModulePath = `.${path.sep}${path.relative(process.cwd(), glob)}`;
        const source = fs.readFileSync(relativeModulePath).toString();
    
        return ts.createSourceFile(
          'my-element.js',
          source,
          ts.ScriptTarget.ES2015,
          true,
        );
      });

    const result = create({modules, plugins: [myPlugin()]});

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    assert.equal(result, fixture);
  });
});

test.run();