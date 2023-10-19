export default function myPlugin() {
  return {
    name: 'my-plugin',
    // Runs for all modules in a project, before continuing to the `analyzePhase`
    collectPhase({ts, node, context}){},
    // Runs for each module
    analyzePhase({ts, node, moduleDoc, context}){
      // You can use this phase to access a module's AST nodes and mutate the custom-elements-manifest
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          const className = node.name.getText();

          node.members?.forEach(member => {
            const memberName = member.name.getText();

            member.jsDoc?.forEach(jsDoc => {
              jsDoc.tags?.forEach(tag => {
                if(tag.tagName.getText() === 'foo') {
                  const description = tag.comment;

                  const classDeclaration = moduleDoc.declarations.find(declaration => declaration.name === className);
                  const messageField = classDeclaration.members.find(member => member.name === memberName);
                  
                  messageField.foo = description
                }
              });
            });
          });
      }
    },
    // Runs for each module, after analyzing, all information about your module should now be available
    moduleLinkPhase({moduleDoc, context}){},
    // Runs after modules have been parsed and after post-processing
    packageLinkPhase({customElementsManifest, context}){},
  }
}