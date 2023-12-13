#!/usr/bin/env node

const chalk = require('chalk');

console.log(`

${chalk.green(`Thanks for installing the 'Custom Elements LSP Plugin'. 🎉`)}

${chalk
  .black
  .bgHex('#ff6700')
  .underline('Please configure your tsconfig.json and IDE to complete integration.')}
https://www.npmjs.com/package/@genesiscommunitysuccess/custom-elements-lsp#plugin-setup-and-usage

`);
