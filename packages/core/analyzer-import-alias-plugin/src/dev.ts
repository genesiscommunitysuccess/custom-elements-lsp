import fs from 'fs';
import ts from 'typescript';
import { create } from '@custom-elements-manifest/analyzer/src/create.js';
import myPlugin from './index.js';

debugger;

const code = fs.readFileSync('fixtures/default/sourcecode/default.js').toString();

const modules = [ts.createSourceFile('my-element.js', code, ts.ScriptTarget.ES2015, true)];

console.log(
  JSON.stringify(create({ modules, plugins: [], context: { dev: true } }), null, 2)
  // JSON.stringify(create({ modules, plugins: [myPlugin({})], context: { dev: true } }), null, 2)
);
