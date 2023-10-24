import { Plugin } from '@custom-elements-manifest/analyzer';

const name = 'analyzer-import-alias-plugin';

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
    name,
    // Runs for all modules in a project, before continuing to the `analyzePhase`
    collectPhase({ ts, node, context }) {},
    // Runs for each module
    analyzePhase({ ts, node, moduleDoc, context }) {
      // Runs for each module, after analyzing, all information about your module should now be available
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          const className = (node as any).name.getText();
          (node as any)?.jsDoc?.forEach((jsDoc: any) => {
            jsDoc.tags?.forEach((tag: any) => {
              if (tag.tagName.getText() === 'inheritance') {
                const maybeMatches = [...tag.comment.match(/(\w+)\s+->\s+(\w+)/)];
                const matchLen = 3;
                if (maybeMatches.length === matchLen) {
                  const [_, superclassName, subclassName] = maybeMatches;
                  const classDeclaration = (moduleDoc as any)?.declarations.find(
                    (declaration: any) => declaration.name === className,
                  );
                  const exportDeclaration = (moduleDoc as any)?.exports.find(
                    (exp: any) => exp.name === className,
                  );
                  debugger;
                  if (classDeclaration?.superclass?.name && exportDeclaration.declaration?.name) {
                    classDeclaration.superclass.name = superclassName;
                    classDeclaration.name = subclassName;
                    exportDeclaration.name = subclassName;
                    exportDeclaration.declaration.name = subclassName;
                  }
                  debugger;
                }
              }
            });
          });
      }
    },
    moduleLinkPhase({ moduleDoc, context }) {},
    // Runs after modules have been parsed and after post-processing
    packageLinkPhase({ customElementsManifest, context }) {},
  };
}
