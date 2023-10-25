import { Plugin } from '@custom-elements-manifest/analyzer';
import type { ClassDeclaration, Reference, Module } from 'custom-elements-manifest';
import * as ts from 'typescript';

const pluginName = 'analyzer-import-alias-plugin';

export type AppliedTransform = {
  class: string;
  package: string;
  path: string;
  superclass: string;
};

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
            applySuperclassTransformMangleClass(classDef, moduleDoc, config);
          }
      }
    },
    moduleLinkPhase({ moduleDoc, context }) {},
    // Runs after modules have been parsed and after post-processing
    packageLinkPhase({ customElementsManifest, context }) {
      debugger;
      // TODO: Can I set the names back here now?
      // TODO: Need to account for changed names if other source files import your module we change
    },
  };
}

/**
 * Transforms the reference to the superclass name by the specified config.
 * @remarks
 * Apply any tranform config to the superclass name (if any) and then mangle the class
 * name to ensure it doesn't equal the new superclass name.
 * @param classDef - The class definition containing the superclass defintiion to transform.
 * @param moduleDoc - The module doc containing the export definition which we need to change to match, or the definition will be culled.
 * @param config - The plugin config containing a potential transform.
 * @returns AppliedTransform - The transform applied to the class definition, used to reverse later. Or null if no transform was applied.
 */
export function applySuperclassTransformMangleClass(
  classDef: ClassDeclaration,
  moduleDoc: Partial<Module>,
  config: ImportAliasPluginOptions,
): AppliedTransform | null {
  if (!classDef?.superclass?.package) {
    throw new Error('Class definition does not contain a superclass definition.');
  }
  const { package: pkg, name } = classDef.superclass as Reference;
  const importConfig = config[pkg as string];

  if (!importConfig) {
    throw new Error('Plugin config does not contain config for superclass package');
  }
  const maybeNewSuperclassName =
    importConfig.override?.[name] ||
    (() => {
      const maybeNewName = importConfig['*']?.(name);
      return maybeNewName === name ? undefined : maybeNewName;
    })();
  if (!maybeNewSuperclassName) return null;

  const transform: AppliedTransform = {
    path: moduleDoc.path!,
    class: classDef.name,
    package: pkg!,
    superclass: classDef.superclass.name,
  };

  const originalChildClassName = classDef.name;
  classDef.superclass!.name = maybeNewSuperclassName;
  classDef.name = `s_${classDef.name}`;
  // Require to update the export name to match or one of the analyzer base systems will cull the definition.
  const moduleExport = moduleDoc.exports?.find(
    ({ name: exportName }) => exportName === originalChildClassName,
  );
  moduleExport!.name = classDef.name;
  moduleExport!.declaration!.name = classDef.name;
  return transform;
}
