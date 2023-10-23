import fs from 'fs';
import ts from 'typescript';
// import ts from '../../../../../../../../../../../tmp/cem-plugin-template/node_modules/typescript/lib/typescript.js';
import { create } from '@custom-elements-manifest/analyzer/src/create.js';
import myPlugin from './index.js';

console.log(`ts.version: ${ts.version} in lib`);

debugger;

// const code = fs.readFileSync('fixtures/default/sourcecode/default.js').toString();
const code = `
export class MyElement extends HTMLElement {
  /**
   * @foo Some custom information!
   */
  someField = '';
}
`;
console.log(code);

const modules = [ts.createSourceFile('my-element.js', code, ts.ScriptTarget.ES2015, true)];

console.log(
  JSON.stringify(create({ modules, plugins: [], context: { dev: true } }), null, 2)
  // JSON.stringify(create({ modules, plugins: [myPlugin({})], context: { dev: true } }), null, 2)
);
