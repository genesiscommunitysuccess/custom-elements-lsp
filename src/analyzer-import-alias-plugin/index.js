const name = 'analyzer-import-alias-plugin';

function cacheImportAlias(context, aliasName, baseName, path) {
  if (context[name].alias === undefined) {
    context[name].alias = new Map();
  }
  context[name].alias.set(`${path};${aliasName}`, baseName);
}

function readCacheImportAlias(context, aliasName, path) {
  return context[name].alias.get(`${path};${aliasName}`);
}

function procesImport({ ts, node, moduleDoc, context }) {
  // debugger;
  node?.importClause?.namedBindings?.elements
    ?.filter((x) => x.propertyName !== undefined)
    .forEach((x) =>
      cacheImportAlias(context, x.name.getText(), x.propertyName.getText(), moduleDoc.path)
    );
}

export default function myPlugin() {
  return {
    name,
    // Runs for all modules in a project, before continuing to the `analyzePhase`
    collectPhase({ ts, node, context }) {
      if (context[name] === undefined) {
        context[name] = {};
      }
    },
    // Runs for each module
    analyzePhase({ ts, node, moduleDoc, context }) {
      // debugger;
      // console.log(ts.SyntaxKind[node.kind])
      // context[name] = context[name] ? context[name] + 1 : 1;
      switch (node.kind) {
        case ts.SyntaxKind.ImportDeclaration:
          procesImport({ ts, node, moduleDoc, context });
      }
    },
    // Runs for each module, after analyzing, all information about your module should now be available
    moduleLinkPhase({ moduleDoc, context }) {
      moduleDoc.declarations
        ?.filter((dec) => dec.kind === 'class')
        .forEach((dec) => {
          const maybeBaseName = readCacheImportAlias(context, dec.superclass?.name, moduleDoc.path);
          if (maybeBaseName) {
            dec.name = dec.name;
            dec.superclass.name = maybeBaseName;
          }
        });
      debugger;
    },
    // Runs after modules have been parsed and after post-processing
    packageLinkPhase({ customElementsManifest, context }) {
      debugger;
      console.log(context);
    },
  };
}
