The [Genesis Global](https://genesis.global) Community Success initiative is committed to open-sourcing select technologies that we believe the open-source community would benefit from.

[![NPM version](https://img.shields.io/npm/v/@genesiscommunitysuccess/custom-elements-lsp)](https://www.npmjs.com/package/@genesiscommunitysuccess/custom-elements-lsp) [![License](https://img.shields.io/github/license/genesiscommunitysuccess/custom-elements-lsp)](https://github.com/genesiscommunitysuccess/custom-elements-lsp/blob/master/LICENSE)

# Custom Elements LSP Plugin

>> This is a pre-release version of the plugin; therefore, it will be missing features and likely contain bugs.

<!-- Add an intro to the LSP stuff in FUI-1186 -->

## Plugin Setup and Usage

These instructions are for setting up the LSP in your application. If you are wanting to set up the LSP test it or contribute to it then go to [this section](#plugin-development).
To use this plugin you have a version of typescript as part of the project, located inside of the `node_modules`.

1. Ensure the package is installed in your `package.json` and you've run `npm install`.
2. Update your `tsconfig.json` with the following info:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@genesiscommunitysuccess/custom-elements-lsp",
        "srcRouteFromTSServer": "../../..",
        "designSystemPrefix": "example",
        "parser": {
          "fastEnable": true,
          "timeout": 2000,
          "dependencies": [
            "node_modules/example-lib/**/custom-elements.json",
            "!**/@custom-elements-manifest/**/*"
          ]
        },
        "plugins": ["@genesiscommunitysuccess/cep-fast-plugin"]
      }
    ]
  }
}
```
> You need to use a target of `ES2021` or later.

Base options.

| Option                | Optional and Default | Explanation                                                                                                                                                                                                                                                                  |
|---|---|--|
| `name`                | False                | Need to set as `@genesiscommunitysuccess/custom-elements-lsp` to enable this plugin.                                                                                                                                                                                         |
| `srcRootFromTSServer` | True (`"../../../"`)   | `srcRouteFromTSServer` is the relative path from the `tsserver.js` executable in your node modules, to your directory with the `package.json` where the project web root is located. This is likely to be `node_modules/typescript/lib/tsserver.js` hence we use `../../..`. *WARNING:* If you are using a monorepo pattern with workspaces, you must account for potential hoisting of the TypeScript library in the `node_modules` to a parent directory.|
| `designSystemPrefix`  | True (N/A)           | Used to work with `%%prefix%%` to handle components registered as part of a design system. See [here](#advanced-usage).                                                                                                                                                      |
| `plugins`  | True (`[]`)           | Set of optional plugins you can add to the CEP to enhance its functionality. Specified plugins are applied in order. |


Parser options. These control the analysis of the source code to understand semantics such as whether a custom element has a property or not. This is not controlling the LSP working with the html in the templates to understand whether there are diagnostic issues, or to aid with completion suggestions.

| Option | Optional and Default | Explanation |
|---|---|---|
| `src` | True (`"src/**/*.{js,ts}"`) | The glob of the source files in the current project to analyze live.  |
| `timeout` | True (2000) | Time in milliseconds to debounce calls between running the analyzer on the source files. The lower the time the more responsive the LSP will be to changes in the source code but the more resources it will use. |
| `dependencies` | True (`[]`) | An array of strings of globs that find `custom-elements.json` from library dependencies to use with the LSP. Libraries will ship production code with which the analyzer will not be able to parse, so the libraries need to ship the manifest generated [from the analyzer](https://custom-elements-manifest.open-wc.org/analyzer/config/). An example default you could use to load all files would be `["node_modules/**/custom-elements.json","!**/@custom-elements-manifest/**/*"]` which will find all of the manifests in your dependencies, but ignore the test manifests from the analzyer dependency itself.
| `fastEnable`          | True (disabled)      | Enables Microsoft FAST parsing of local components. You need to enable the plugin too for full functionality |

Only the `src` files are watched for changes to update the analyzer, if you update the dependencies containing manifest files you must restart the LSP for it to be aware of the changes.

*WARNING:* If you are using a monorepo pattern with workspaces, you must account for potential hoisting of the TypeScript library in the `node_modules` to a parent directory. The path of `src` and `dependencies` will be relative to the path created from the typescript install location and the `srcRouteFromTSServer` config option.

### FAST Syntax

There is current support for enhanced FAST handing (syntax such as `@event` on the template definitions). To enable this you'll need perform the following steps:
1. Enable enhanced completions and diagnostics by setting the `"fastEnable": true` parser option in your `tsconfig.json`.
2. Install the `@genesiscommunitysuccess/cep-fast-plugin` to your project with your package manager.
3. Add the package from step 2 in your `plugins` array in your main config block in your `tsconfig.json`. See the example at the top of the page.

### VSCode

You just need to setup VSCode to use your local typescript install as by default it will try and use a version of typescript it is bundled with.

1. You need to create a `settings.json` file inside of a `.vscode` directory, this is to configure VSCode to see the locally installed typescript binary (ensure `typescript.tdsk` points to the `lib` directory of the project typescript install). You can see an example of this in this repository - `./example/.vscode/settings.json`. If npm has hoisted your typescript install, ensure the path you configure accounts for that.
2. Launch VSCode on the project directory that contains the `.vscode` directory.
3. Configure workspace version to local using `Typescript: Select Typescript Version` from the command palette https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript. If you are having issues seeing this menu option ensure you have a typescript file open.

### NVIM

If you have an LSP setup for typescript this should work straight away using the project's TypeScript.

### Advanced Usage

`designSystemPrefix` is used to specify how to handle custom elements which are defined but exported as an element registry function, and later registered against a design system with a specific prefix. An example of this is [FAST component libraries](https://www.fast.design/docs/design-systems/creating-a-component-library). Export these with the magic string `%%prefix%%-` at the start of the tagname and then `designSystemPrefix` will override the `%%prefix%%`.

In the config of this repository it is set to `example` because we use the `example` prefix as set in `./example/src/components.ts`. An example of a component exported in this way can be found in the `./example/src/components/button/` directory.

### Troubleshooting

#### Analyzer Script

If the results of the LSP are not what you're expecting (e.g. incorrect or missing information) then it may be because the source and dependencies paths have an issue, and the plugin is not able to correctly find the files to parse.

You can generate a copy of the manifest file that the plugin is using by running the analyzer executable script which is provided with this plugin with the `custom-elements-analyze` command.

1. Set up a npm script in your `package.json` to execute the command. For example:

```json
{
  "scripts": {
    "lsp:analyze": "custom-elements-analyze --tsconfig='./src/tsconfig.json'",
  },
}
```

The script currently takes an optional argument:
- `--tsconfig` - the path to the tsconfig.json file to use. Defaults to `process.cwd()`.
- `--fastEnable` is set from the plugin config.

This `package.json` needs to be the same location on the file system that the `srcRouteFromTSServer` relative path gets you to, as explained in [the setup section](#plugin-setup-and-usage).

2. Run the npm script you just created with `npm run lsp:analyze`.
3. Check `ce.json` to see what components have issues, or are missing from the manifest.
4. If there are any issues then you can change the glob patterns and repeat from step 1 until you're happy.
5. Once you are receiving the correct output from the script you can update your `tsconfig.json` to fix the issue in the LSP plugin.

##### Analyzer Script Extra

If you are still running into issues then you can spend time verifying that the debugging analyzer script is getting the same view as the CEP itself.
1. Complete the `Setup Logging` section from the [contributing](./CONTRIBUTING.md) document.
2. Run the CEP in your IDE and check the logs for a line that looks roughly like `Info 32   [14:43:25.686] [CE] Analyzing and updating manifest. Config: ...`
3. Run the analyzer script and see the same line like `[log] Analyzing and updating manifest. Config: ...`
4. Verify they're the same. If not then there is potentially something wrong with your plugin setup.

## Contributing

Thanks for taking interest in contributing to the Custom Elements Plugin. See the contributing guidelines (`CONTRIBUTING.md`) at the root of the monorepo.

## License

See [here](./LICENSE).
