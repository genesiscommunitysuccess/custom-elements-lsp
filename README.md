# Custom Elements Monorepo

This repository contains multiple packages which can be used to work with [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements).

To get started run `$ npm run bootstrap` in your shell.

## Packages

### Custom Elements LSP Plugin

[![NPM version](https://img.shields.io/npm/v/@genesiscommunitysuccess/custom-elements-lsp)](https://www.npmjs.com/package/@genesiscommunitysuccess/custom-elements-lsp) [![License](https://img.shields.io/github/license/genesiscommunitysuccess/custom-elements-lsp)](https://github.com/genesiscommunitysuccess/custom-elements-lsp/blob/master/LICENSE)
The [CEP](./packages/core/custom-elements-lsp/README.md) is the primary package of the monorepo, and is a plugin for the TypeScript language server which adds in support for custom elements.

![Autocompletion of custom element tag names](./packages/core/custom-elements-lsp/docs/images/base_ce_completion.gif "Custom Element Completion" =25%x) ![Autocompletion of custom element attribute](./packages/core/custom-elements-lsp/docs/images/base_attr_completion.gif "Attribute Completion" =25%x) ![Diagnostics of invalid attributes on a custom element](./packages/core/custom-elements-lsp/docs/images/base_invalid_attr.gif "Diagnostics" =25%x) ![Jumping to definition source file of a custom element](./packages/core/custom-elements-lsp/docs/images/base_jump_to_definition.gif "Jump to Definition" =25%x)

### CEP FAST Plugin

[![NPM version](https://img.shields.io/npm/v/@genesiscommunitysuccess/cep-fast-plugin)](https://www.npmjs.com/package/@genesiscommunitysuccess/cep-fast-plugin) [![License](https://img.shields.io/github/license/genesiscommunitysuccess/custom-elements-lsp)](https://github.com/genesiscommunitysuccess/custom-elements-lsp/blob/master/LICENSE)
[Plugin](./packages/core/cep-fast-plugin/README.md) for the CEP which enables https://www.fast.design/ enhancements. Examples of this is using the `:prop` syntax for property bindings, and `?attr` syntax for boolean attributes.


![Property binding autocompletion](./packages/core/cep-fast-plugin/docs/images/fast_property_binding.gif "Property Binding Autocompletion") ![Boolean attribute autocompletion](./packages/core/cep-fast-plugin/docs/images/fast_boolean_attr_binding.gif "Boolean Attribute Binding Autocompletion") ![Event binding autocompletion](./packages/core/cep-fast-plugin/docs/images/fast_event_binding.gif "Event Binding Autocompletion") ![Extra quickinfo functionality](./packages/core/cep-fast-plugin/docs/images/fast_quicklook.gif "Quickinfo Extended Functionality")

### Analyzer Import Alias Plugin

The [Analyzer Plugin](./packages/core/analyzer-import-alias-plugin/README.md) is a plugin for the [custom elements analyzer](https://custom-elements-manifest.open-wc.org/analyzer/getting-started/) which enhances its support for import aliases.

[![NPM version](https://img.shields.io/npm/v/@genesiscommunitysuccess/analyzer-import-alias-plugin)](https://www.npmjs.com/package/@genesiscommunitysuccess/analyzer-import-alias-plugin) [![License](https://img.shields.io/github/license/genesiscommunitysuccess/custom-elements-lsp)](https://github.com/genesiscommunitysuccess/custom-elements-lsp/blob/master/LICENSE)

### Showcase Example

The private [showcase example](./packages/showcase/example/README.md) application is a test harness application built with TypeScript and MS Fast and is used to test out the Custom Elements Plugin (CEP) locally inside the monorepo.

### Showcase Example Library

The private [showcase example library](./packages/showcase/example-lib/README.md) is an example library of web components. It can be used as a test harness for testing the Custom Elements Plugin (CEP) to demonstrate that it works with library code, and it is imported into the showcase example app to demonstrate that the CEP works with imported code.

## Contributing

Thanks for taking interest in contributing to the Custom Elements Plugin. See [the contributing guidelines](./CONTRIBUTING.md).

## License

See [here](./LICENSE).
