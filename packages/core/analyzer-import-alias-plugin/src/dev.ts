import fs from 'fs';
import { create } from '@custom-elements-manifest/analyzer/src/create.js';
import ts from 'typescript';
import importAliasPlugin from './index.js';

const baseFilePath = '/test/fixtures/default/sourcecode/default.js';
const parentFilePath = '/test/fixtures/default/sourcecode/superclass.js';

const defaultCode = fs.readFileSync(process.cwd() + baseFilePath).toString();
const superclassCode = fs.readFileSync(process.cwd() + parentFilePath).toString();

const modules = [
  ts.createSourceFile(baseFilePath, defaultCode, ts.ScriptTarget.ES2021, true),
  ts.createSourceFile(parentFilePath, superclassCode, ts.ScriptTarget.ES2021, true),
];

console.log(modules);

console.log(JSON.stringify(create({ modules, plugins: [importAliasPlugin({})] }), null, 2));
