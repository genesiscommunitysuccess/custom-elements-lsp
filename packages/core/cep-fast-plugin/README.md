The [Genesis Global](https://genesis.global) Community Success initiative is committed to open-sourcing select technologies that we believe the open-source community would benefit from.

[![NPM version](https://img.shields.io/npm/v/@genesiscommunitysuccess/custom-elements-lsp)](https://www.npmjs.com/package/@genesiscommunitysuccess/custom-elements-lsp) [![License](https://img.shields.io/github/license/genesiscommunitysuccess/custom-elements-lsp)](https://github.com/genesiscommunitysuccess/custom-elements-lsp/blob/master/LICENSE)

# CEP FAST Plugin

This is a [@genesiscommunitysuccess/custom-elements-lsp](https://www.npmjs.com/package/@genesiscommunitysuccess/custom-elements-lsp) (CEP) plugin which adds enhancements to support [FAST](https://www.fast.design/). Enhancements include:

* Support for property bindings autocompletion and diagnostics for `:prop`. Extra info in quickinfo window.
* Support for boolean attribute bindings in templates `?attr`.
* Support for event bindings autocompletion and diagnostics for `@events`. Extra info in quickinfo window.

## Setup

1. You need to follow the setup guide for the CEP [here](https://www.npmjs.com/package/@genesiscommunitysuccess/custom-elements-lsp).
2. You need to install this plugin and configure it with the CEP. See instructions [here](https://www.npmjs.com/package/@genesiscommunitysuccess/custom-elements-lsp#fast-syntax).

> If using this plugin and you're using a design system you'll likely want to configure `designSystemPrefix` as specified in the main instructions too.

At minimum you'll need the following configuration to enable FAST enhancements:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@genesiscommunitysuccess/custom-elements-lsp",
        "designSystemPrefix": "example",
        "parser": {
          "fastEnable": true,
        },
        "plugins": ["@genesiscommunitysuccess/cep-fast-plugin"]
      }
    ]
  }
}
```

## Contributing

Thanks for taking interest in contributing to the Custom Elements Plugin. See the contributing guidelines (`CONTRIBUTING.md`) at the root of the monorepo.

## License

See [here](./LICENSE).
