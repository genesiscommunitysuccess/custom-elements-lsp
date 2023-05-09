# PoC LSP Plugin

## Plugin Setup and Usage

To use this plugin you have a version of typescript as part of the project, located inside of the `node_modules`.

1. Ensure the package is installed in your `package.json` and you've run `npm install`.
2. Update your `tsconfig.json` with the following info:
```json
	"compilerOptions": {
		"plugins": [
			{
				"name": "webcomponents-lsp-plugin",
				"srcRouteFromTSServer": "../../.."
			}
		],
    }
```
> `srcRouteFromTSServer` is the relative path from the `tsserver.js` executable in your node modules, to your directory with the `package.json` where `ce.json` (see step 4) is saved to. This is likely to be `node_modules/typescript/lib/tsserver.js` hence we use `../../..`.

3. Configure a npm command to generate all of the custom element manifest for your local source files and the globs of any dependencies to use too. `"lsp:analyse": "customelements-analyse --watch --src='web/src/**/*.{js,ts}' --lib='node_modules/@genesislcap/**/custom-elements.json'",`
<!-- TODO: need much better explanation of this command -->
4. Run `npm run lsp:analyse` to generate the manifest `ce.json` (you might want to add this to your `.gitignore`).
5. Any IDE specific configuration...

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
3. `npm link webcomponents-lsp-plugin`

While developing:
1. `npx tsc --watch` from the root directory to incrementally transpile the plugin.

To view logs
1. Set env var `TSS_LOG="-logToFile true -file /path/to/lsp.log -level verbose"`
2. View logs at specified location

> If you're using VSCode you can view the logs using `TypeScript: Open TS Server log` from the command palette.
