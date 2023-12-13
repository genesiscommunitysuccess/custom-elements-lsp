import { readFileSync } from 'fs';
import { create } from '@custom-elements-manifest/analyzer/src/create.js';
import { createSourceFile, ScriptTarget } from 'typescript';
import importAliasPlugin from './index.js';

const defaultCode = readFileSync('test/fixtures/default/sourcecode/default.js').toString();
const anotherCode = readFileSync('test/fixtures/default/sourcecode/another.js').toString();

const superclassManifest = JSON.parse(
  readFileSync('test/fixtures/default/superclass.manifest.json').toString(),
);

const modules = [
  createSourceFile('my-element.js', defaultCode, ScriptTarget.ES2015, true),
  createSourceFile('another-class.js', anotherCode, ScriptTarget.ES2015, true),
];

console.log(
  JSON.stringify(
    create({
      modules,
      plugins: [
        importAliasPlugin({
          ['my-library']: {
            ParentElement: 'MyElement',
          },
        }),
      ],
      context: { dev: true, thirdPartyCEMs: [superclassManifest] },
    }),
    null,
    2,
  ),
);
