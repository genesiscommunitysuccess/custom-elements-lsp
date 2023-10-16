# cem-plugin-template

This is a starter repository to easily get set up to write custom plugins for [@custom-elements-manifest/analyzer](https://github.com/open-wc/custom-elements-manifest). For more information on authoring custom plugins, see the [authoring plugins documentation](https://github.com/open-wc/custom-elements-manifest/blob/master/packages/analyzer/docs/plugins.md).

## Development

```bash
# install dependencies
npm install

# start local development
npm start

# run tests
npm test
```

> **TIP:** When writing custom plugins, [ASTExplorer](https://astexplorer.net/#/gist/f99a9fba2c21e015d0a8590d291523e5/cce02565e487b584c943d317241991f19b105f94) is your friend 🙂

## Usage

### Install:

```bash
npm i -D cem-plugin-<pluginname>
```

### Import

`custom-elements-manifest.config.js`:
```js
import myPlugin from 'cem-plugin-template';

export default {
  plugins: [
    myPlugin()
  ]
}
```

## Supported syntax

Document an example of the syntax your plugin supports

```js
export class MyElement extends HTMLElement {
  /**
   * @foo Some custom information!
   */ 
  message = ''
}
```

## Expected output

Document an example of the expected output custom elements manifest

```diff
{
  "schemaVersion": "0.1.0",
  "readme": "",
  "modules": [
    {
      "kind": "javascript-module",
      "path": "my-element.js",
      "declarations": [
        {
          "kind": "class",
          "description": "",
          "name": "MyElement",
          "members": [
            {
              "kind": "field",
              "name": "message",
              "default": "",
+             "foo": "Some custom information!"
            }
          ],
          "superclass": {
            "name": "HTMLElement"
          },
          "customElement": true
        }
      ],
      "exports": [
        {
          "kind": "js",
          "name": "MyElement",
          "declaration": {
            "name": "MyElement",
            "module": "my-element.js"
          }
        }
      ]
    }
  ]
}
```
