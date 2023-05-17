# Custom Elements LSP Plugin

## Plugin Setup and Usage

To use this plugin you have a version of typescript as part of the project, located inside of the `node_modules`.

1. Ensure the package is installed in your `package.json` and you've run `npm install`.
2. Update your `tsconfig.json` with the following info:
```json
	"compilerOptions": {
		"plugins": [
			{
				"name": "@genesiscommunitysuccess/custom-elements-lsp",
				"srcRouteFromTSServer": "../../..",
                		"designSystemPrefix": "example"
			}
		],
    }
```
> `srcRouteFromTSServer` is the relative path from the `tsserver.js` executable in your node modules, to your directory with the `package.json` where `ce.json` (see step 4) is saved to. This is likely to be `node_modules/typescript/lib/tsserver.js` hence we use `../../..`.

3. Configure a npm command to generate all of the custom element manifest for your local source files and the globs of any dependencies to use too. `"lsp:analyse": "customelements-analyse --watch --src='web/src/**/*.{js,ts}' --lib='node_modules/**/custom-elements.json'",`
<!-- TODO: need much better explanation of this command -->
4. Run `npm run lsp:analyse` to generate the manifest `ce.json` (you might want to add this to your `.gitignore`).
5. Run `npx tsc` in the root of the project to compile the plugin code. (This will be done automatically in a future release!)
6. Any IDE specific configuration...

### VSCode

You just need to setup VSCode to use your local typescript install as by default it will try and use a version of typescript it is bundled with.

1. Launch using the settings in `.vscode` directory (ensure `typescript.tdsk` points to the `lib` directory of the project typescript install). You can see an example of this in this repository - `./example/.vscode/settings.json`.
2. Configure workspace version to local using `Typescript: Select Typescript Version` from the command palette https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript

### NVIM

If you have an LSP setup for typescript this should work straight away using the project's TypeScript.

## Plugin Development

Playground based on https://github.com/orta/TypeScript-TSServer-Plugin-Template and https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin#overview-writing-a-simple-plugin

The app in `/example` is setup to use the LSP plugin out of the box for NVIM and VSCode currently, other LSP IDEs may need some other configuration.

The LSP plugin should be symlinked locally via the `package.json` but if you're having issues you can manually link the plugin:
1. `npm link` in the project root
2. `cd example`
3. `npm link @genesiscommunitysuccess/custom-elements-lsp`

While developing:
1. `npx tsc --watch` from the root directory to incrementally transpile the plugin.

To view logs
1. Set env var `TSS_LOG="-logToFile true -file /path/to/lsp.log -level verbose"`
2. View logs at specified location

> If you're using VSCode you can view the logs using `TypeScript: Open TS Server log` from the command palette.

### Example Library

The directory `/example-lib` contains a small example library which publishes a FAST web component and associated custom elements manifest. It is added as a dependency of the example app already, and then you need to build the output using `npm run build` for use in the example app.

## Advanced Usage

`designSystemPrefix` is used to specify how to handle custom elements which are defined but exported as an element registry function, and later registered against a design system with a specific prefix. An example of this is [FAST component libraries](https://www.fast.design/docs/design-systems/creating-a-component-library). Export these with the magic string `%%prefix%%-` at the start of the tagname and then `designSystemPrefix` will override the `%%prefix%%`.

In the config of this repository it is set to `example` because we use the `example` prefix as set in `./example/src/components.ts`. An example of a component exported in this way can be found in the `./example/src/components/button/` directory.
