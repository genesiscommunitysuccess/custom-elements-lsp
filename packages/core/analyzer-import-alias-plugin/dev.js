import fs from 'fs';
import ts from 'typescript';
import { create } from '../../../../../../../../../../tmp/cem-plugin-template/node_modules/@custom-elements-manifest/analyzer/src/create.js';
// import myPlugin from './dist/index.js';
import myPlugin from '../../../../../../../../../../tmp/cem-plugin-template/index.js';

const code = fs.readFileSync('src/fixtures/default/sourcecode/default.js').toString();

console.log(process.cwd());

const modules = [ts.createSourceFile(
  'my-element.js',
  code,
  ts.ScriptTarget.ES2015,
  true,
)];

console.log(JSON.stringify(create({modules, plugins: [myPlugin()]}), null, 2));
