import fs from 'fs';
import { create } from '@custom-elements-manifest/analyzer/src/create.js';
import ts from 'typescript';
import importAliasPlugin from './index.js';

const defaultCode = fs.readFileSync('test/fixtures/default/sourcecode/default.js').toString();
const superclassCode = fs.readFileSync('test/fixtures/default/sourcecode/superclass.js').toString();
const anotherCode = fs.readFileSync('test/fixtures/default/sourcecode/another.js').toString();

const modules = [
  ts.createSourceFile('my-element.js', defaultCode, ts.ScriptTarget.ES2021, true),
  ts.createSourceFile('super-class.js', superclassCode, ts.ScriptTarget.ES2021, true),
  ts.createSourceFile('another-class.js', anotherCode, ts.ScriptTarget.ES2021, true),
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
      context: { dev: true },
    }),
    null,
    2,
  ),
);
