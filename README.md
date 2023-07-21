The [Genesis Global](https://genesis.global) Community Success initiative is committed to open-sourcing select technologies that we believe the open-source community would benefit from.

# Custom Elements LSP Plugin

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
        "fastEnable": true,
        "parser": {
          "timeout": 2000,
          "dependencies": [
            "node_modules/example-lib/**/custom-elements.json",
            "!**/@custom-elements-manifest/**/*"
          ]
        }
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
| `srcRootFromTSServer` | True (`"../../../"`)   | `srcRouteFromTSServer` is the relative path from the `tsserver.js` executable in your node modules, to your directory with the `package.json` where the project web root is located. This is likely to be `node_modules/typescript/lib/tsserver.js` hence we use `../../..`. |
| `designSystemPrefix`  | True (N/A)           | Used to work with `%%prefix%%` to handle components registered as part of a design system. See [here](#advanced-usage).                                                                                                                                                      |
| `fastEnable`          | True (disabled)      | Enables Microsoft FAST parsing and completion (e.g. `:prop` property binding syntax).                                                                                                                                                                                        |


Parser options. These control the analysis of the source code to understand semantics such as whether a custom element has a property or not. This is not controlling the LSP working with the html in the templates to understand whether there are diagnostic issues, or to aid with completion suggestions.

| Option | Optional and Default | Explanation |
|---|---|---|
| `src` | True (`"src/**/*.{js,ts}"`) | The glob of the source files in the current project to analyze live.  |
| `timeout` | True (2000) | Time in milliseconds to debounce calls between running the analyzer on the source files. The lower the time the more responsive the LSP will be to changes in the source code but the more resources it will use. |
| `dependencies` | True (`[]`) | An array of strings of globs that find `custom-elements.json` from library dependencies to use with the LSP. Libraries will ship production code with which the analyzer will not be able to parse, so the libraries need to ship the manifest generated [from the analyzer](https://custom-elements-manifest.open-wc.org/analyzer/config/). An example default you could use to load all files would be `["node_modules/**/custom-elements.json","!**/@custom-elements-manifest/**/*"]` which will find all of the manifests in your dependencies, but ignore the test manifests from the analzyer dependency itself.

Only the `src` files are watched for changes to update the analyzer, if you update the dependencies containing manifest files you must restart the LSP for it to be aware of the changes.

### FAST Syntax

Enable enhanced completions and diagnostics by setting the `"fastEnable": true` option in your `tsconfig.json`. This will enable syntax such as `@event` on the template definitions.

<!-- If we get more language plugins then we need to also explain about setting the language for the lsp analyzer as well as the plugin -->

### VSCode

You just need to setup VSCode to use your local typescript install as by default it will try and use a version of typescript it is bundled with.

1. You need to create a `settings.json` file inside of a `.vscode` directory. We need to configure VSCode to see the locally installed typescript binary (ensure `typescript.tdsk` points to the `lib` directory of the project typescript install). You can see an example of this in this repository - `./example/.vscode/settings.json`.
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

You can generate a copy of the manifest file that the plugin is using by running the analyzer executable script which is provided with this plugin with the `customelements-analyze` command.

1. Set up a npm script in your `package.json` to execute the command. For example:

```json
{
  "scripts": {
    "lsp:analyze": "customelements-analyze --src='src/**/*.{js,ts}' --dependencies='[\"node_modules/example-lib/**/custom-elements.json\",\"!**/@custom-elements-manifest/**/*\"]'",
  },
}
```

This example has the `--src` and `--dependencies` parameters matching the configuration in `./example/src/tsconfig.json`. This `package.json` needs to be the same location on the filesystem that the `srcRouteFromTSServer` relative path gets you to, as explained in [the setup section](#plugin-setup-and-usage).

> Take care with the syntax for specifying an array of globs for the dependencies. You are required to quote the array and also quote the individual items as strings. Refer back to the example given to double check.

2. Run the npm script `npm run lsp:analyze`.
3. Check `ce.json` to see what components have issues, or are missing from the manifest.
4. If there are any issues then you can change the glob patterns and repeat from step 1 until you're happy.
5. Once you are receiving the correct output from the script you can update your `tsconfig.json` to fix the issue in the LSP plugin.

## Plugin Development

This section helps you to set up the LSP plugin locally so you can contribute to it. Playground based on https://github.com/orta/TypeScript-TSServer-Plugin-Template and https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin#overview-writing-a-simple-plugin

When working on the LSP codebase itself, it is useful to be running an application in order to see what functionality is and is not working. The app in `/example` is setup to use the LSP plugin out of the box for NVIM and VSCode currently, other LSP IDEs may need some other configuration.

While developing:

1. `npm run bootstrap` will do all required setup for installing and building packages for working on the LSP and using the test example apps.
2. `npm run build:watch` from the root directory to incrementally transpile the plugin.

To view logs

1. Set env var `TSS_LOG="-logToFile true -file /path/to/lsp.log -level verbose"`
2. View logs at specified location

> If you're using VSCode you can view the logs using `TypeScript: Open TS Server log` from the command palette.

### Troubleshooting

#### NPM Link

The LSP plugin should be symlinked locally via the `package.json` but if you're having issues you can manually link the plugin:

1. `npm link` in the project root
2. `cd example`
3. `npm link @genesiscommunitysuccess/custom-elements-lsp`

### Example Library

The directory `/example-lib` contains a small example library which publishes a FAST web component and associated custom elements manifest. It is added as a dependency of the example app already, and then you need to build the output using `npm run build` for use in the example app.

### Local Testing in Other Projects

While working on the LSP plugin you can test it out in any Typescript application you'd like, in addition to testing via the included `/example` application.

1. You need to install the plugin as a dev dependency to your application. You can do this either in a similar way to the [NPM link](#npm-link) section, or use the `file:` syntax for a local installation. For an example of the latter method look at the `example/package.json` file.
2. You need to set up your application as explained in [this section](#plugin-setup-and-usage). Again, you'll need to do any IDE specific setup such as configuring the `settings.json` of VSCode as explained previously.
3. Run the `npm run bootstrap` and `npm run build:watch` commands in the LSP directory as explained previously.
