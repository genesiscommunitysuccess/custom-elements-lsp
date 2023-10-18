import { Plugin } from '@custom-elements-manifest/analyzer';

const name = 'analyzer-import-alias-plugin';

export default function myPlugin(): Plugin {
  return {
    name,
    collectPhase({ ts, node, context }) {},
    // Runs for each module
    analyzePhase({
      ts,
      node,
      moduleDoc,
      context,
    }: {
      ts: any;
      node: any;
      moduleDoc: any;
      context: any;
    }) {
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          const className = node?.name.getText();
          node?.jsDoc?.forEach((jsDoc: any) => {
            jsDoc.tags?.forEach((tag: any) => {
              if (tag.tagName.getText() === 'inheritance') {
                const maybeMatches = [...tag.comment.match(/(\w+)\s+->\s+(\w+)/)];
                const matchLen = 3;
                if (maybeMatches.length === matchLen) {
                  const [_, superclassName, subclassName] = maybeMatches;
                  const classDeclaration = moduleDoc.declarations.find(
                    (declaration: any) => declaration.name === className
                  );
                  const exportDeclaration = moduleDoc.exports.find(
                    (exp: any) => exp.name === className
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
    packageLinkPhase({ customElementsManifest, context }) {},
  };
}
