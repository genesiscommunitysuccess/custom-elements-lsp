The [Genesis Global](https://genesis.global) Community Success initiative is committed to open-sourcing select technologies that we believe the open-source community would benefit from.

[![NPM version](https://img.shields.io/npm/v/@genesiscommunitysuccess/analyzer-import-alias-plugin)](https://www.npmjs.com/package/@genesiscommunitysuccess/analyzer-import-alias-plugin) [![License](https://img.shields.io/github/license/genesiscommunitysuccess/analyzer-import-alias-plugin)](https://github.com/genesiscommunitysuccess/analyzer-import-alias-plugin/blob/master/LICENSE)

# Analyzer Import Alias Plugin

This plugin allows you to work around the limitations of import aliasing with the AST that the analyzer uses. Consider the following pattern which you might use if you are using a design system and system of components:

```typescript
// Imported Button class is a custom element.
import { Button as LibButton } from 'my-library';

// Exported Button has extra styling applied to fit your design system.
export class Button extends LibButton { }
```

This allows you to apply your custom styling to the library button and export with the same name, and then the consumers of your library can swap the import to get your styling. However, this has a problem...

The AST parser that powers the analyzer will be looking for a class named `LibButton` in your library dependencies when working out the inheritance tree of your class `Button`, but because the class is actually called `Button` in the library, the inheritance tree is broken. This means in your manifest that any members that your `Button` class inherits from the `my-library` class (or higher in the inheritance chain) will be lost on the manifest.

This plugin will allow you to fix this issue.

## Usage

### Installation

Install this package as a dependency in the same project that you're using the custom elements manifest analyzer.

You then need to apply this plugin in the `plugins` settings in your `custom-elements-manifest.config.mjs`, see [here](https://custom-elements-manifest.open-wc.org/analyzer/config/#config-file).

### Configuration

Adding the plugin to the plugins array in the manifest config will not accomplish anything by itself, you must also configure the way the plugin handles the name aliases. You can add a configuration for each npm package such as the following.

```typescript
import aliasPlugin from '@genesiscommunitysuccess/analyzer-import-alias-plugin';

export default {
    dependencies: true,
    plugins: [
        aliasPlugin({
            'my-library': {
                '*': (name) => name.replace('Lib','')
            }
        })
    ]
}
```

This will effectively treat any imported superclass from `my-library` as without the `Lib` prefix, so in the first example in the readme the local `Button` class will be correctly inheriting from the package `Button` class.

The shape of the function defined as `*` is `(x: string) => string` so you may perform more complicated logic than the above example to mutate the names. If you don't want to change a name you should return the input name.

There is also an option to set specific replacements for names such as the following:

```typescript
aliasPlugin({
    'my-library': {
        '*': (name) => name.replace('Lib',''),
        override: {
            LibButton: 'MyButton'
        }
    }
})
```

When using this above configuration, the `LibButton` superclass inheritance will be treated as `MyButton`. *Important*, the matching `override` definition will take precedence over the `*` function.

For completeness, you may define as many library imports as you wish, and they may have replacement functions, overrides, or both defined.

```typescript
aliasPlugin({
    'my-library': {
        override: {
            LibButton: 'MyButton'
        }
    },
    'another-library': {
        override: {
            Banana: 'Apple'
        }
    }
})
```
