const name = 'analyzer-import-alias-plugin';

export default function myPlugin() {
  return {
    name,
    collectPhase({ ts, node, context }) {},
    // Runs for each module
    analyzePhase({ ts, node, moduleDoc, context }) {
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          const className = node.name.getText();
          node?.jsDoc?.forEach((jsDoc) => {
            jsDoc.tags?.forEach((tag) => {
              if (tag.tagName.getText() === 'inheritance') {
                const maybeMatches = [...tag.comment.match(/(\w+)\s+->\s+(\w+)/)];
                if (maybeMatches.length === 3) {
                  const [_, superclassName, subclassName] = maybeMatches;
                  const classDeclaration = moduleDoc.declarations.find(
                    (declaration) => declaration.name === className
                  );
                  const exportDeclaration = moduleDoc.exports.find((exp) => exp.name === className);
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
