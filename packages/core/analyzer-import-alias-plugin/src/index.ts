import { Plugin } from '@custom-elements-manifest/analyzer';
import type { ClassDeclaration } from 'custom-elements-manifest';
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
          const maybeSuperclassName = (
            moduleDoc.declarations?.find(
              ({ name, kind }) => name === className && kind === 'class',
            ) as ClassDeclaration | undefined
          )?.superclass?.name;
          debugger;
      }
    },
    moduleLinkPhase({ moduleDoc, context }) {},
    // Runs after modules have been parsed and after post-processing
    packageLinkPhase({ customElementsManifest, context }) {},
  };
}
