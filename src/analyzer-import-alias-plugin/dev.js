import fs from 'fs';
import ts from 'typescript';
import { create } from '@custom-elements-manifest/analyzer/src/create.js';
import myPlugin from './index.js';

const defaultCode = fs.readFileSync('fixtures/default/sourcecode/default.js').toString();
const superclassCode = fs.readFileSync('fixtures/default/sourcecode/superclass.js').toString();

const modules = [
  ts.createSourceFile('my-element.js', defaultCode, ts.ScriptTarget.ES2021, true),
  ts.createSourceFile('super-class.js', superclassCode, ts.ScriptTarget.ES2021, true),
];

console.log(JSON.stringify(create({ modules, plugins: [myPlugin()] }), null, 2));
