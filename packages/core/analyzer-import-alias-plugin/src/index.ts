import { Plugin } from '@custom-elements-manifest/analyzer';
import type { ClassDeclaration, Reference } from 'custom-elements-manifest';
import * as ts from 'typescript';

const pluginName = 'analyzer-import-alias-plugin';

export type ImportAliasPluginOptions = {
  [moduleName: string]: {
    '*'?: (importName: string) => string;
    override?: {
      [importName: string]: string;
    };
  };
};

export default function importAliasPlugin(config: ImportAliasPluginOptions): Plugin {
  const checkedModules = Object.keys(config);
  return {
    name: pluginName,
    // Runs for all modules in a project, before continuing to the `analyzePhase`
    // eslint-disable-next-line @typescript-eslint/no-shadow
    collectPhase({ ts, node, context }) {},
    // Runs for each module
    // eslint-disable-next-line @typescript-eslint/no-shadow
    analyzePhase({ ts, node, moduleDoc, context }) {
      // Runs for each module, after analyzing, all information about your module should now be available
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          const classDeclerationNode = node as ts.ClassDeclaration;
          const className = classDeclerationNode.name?.getText();
          const classDef = moduleDoc.declarations?.find(
            ({ name, kind }) => name === className && kind === 'class',
          ) as ClassDeclaration | undefined;
          debugger;
          if (
            classDef?.superclass?.package &&
            checkedModules.includes(classDef?.superclass?.package)
          ) {
            processOverride(classDef, config);
          }
      }
    },
    moduleLinkPhase({ moduleDoc, context }) {},
    // Runs after modules have been parsed and after post-processing
    packageLinkPhase({ customElementsManifest, context }) {
      // TODO: Can I set the names back here now?
    },
  };
}

function processOverride(classDef: ClassDeclaration, config: ImportAliasPluginOptions): void {
  debugger;
  const { package: pkg, name } = classDef.superclass as Reference;
  const importConfig = config[pkg as string];

  const maybeOverrideName = importConfig.override?.[name];
  if (maybeOverrideName) {
    classDef.superclass!.name = maybeOverrideName;
    classDef.name = `s_${classDef.name}`;
    return;
  }

  const maybeOverrideAll = importConfig['*'];
  if (maybeOverrideAll) {
    classDef.superclass!.name = maybeOverrideAll(name);
    classDef.name = `s_${classDef.name}`;
    return;
  }
}
