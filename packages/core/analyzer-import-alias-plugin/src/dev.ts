import fs from 'fs';
import { create } from '@custom-elements-manifest/analyzer/src/create.js';
import ts from 'typescript';
import importAliasPlugin from './index.js';

const defaultCode = fs.readFileSync('test/fixtures/default/sourcecode/default.js').toString();
const anotherCode = fs.readFileSync('test/fixtures/default/sourcecode/another.js').toString();

const superclassManifest = JSON.parse(
  fs.readFileSync('test/fixtures/default/superclass.manifest.json').toString(),
);

const modules = [
  ts.createSourceFile('my-element.js', defaultCode, ts.ScriptTarget.ES2015, true),
  ts.createSourceFile('another-class.js', anotherCode, ts.ScriptTarget.ES2015, true),
];

console.log(
  JSON.stringify(
    create({
      modules,
      plugins: [
        importAliasPlugin({
          ['my-library']: { override: { ParentElement: 'MyElement' } },
        }),
      ],
      context: { dev: true, thirdPartyCEMs: [superclassManifest] },
    }),
    null,
    2,
  ),
);
