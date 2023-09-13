import fs from 'fs';
import ts from 'typescript';
import { create } from '@custom-elements-manifest/analyzer/src/create.js';
import myPlugin from './index.js';

const code = fs.readFileSync('fixtures/default/sourcecode/default.js').toString();

const modules = [ts.createSourceFile(
  'my-element.js',
  code,
  ts.ScriptTarget.ES2015,
  true,
)];

console.log(JSON.stringify(create({modules, plugins: [myPlugin()]}), null, 2));
