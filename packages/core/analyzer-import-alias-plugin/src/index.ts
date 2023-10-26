import { Plugin } from '@custom-elements-manifest/analyzer';
import type {
  ClassDeclaration,
  Reference,
  Module,
  Package,
  CustomElementDeclaration,
} from 'custom-elements-manifest';
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

// Used to namespace the classnames of local definitions to avoid collisions
export const NAMESPACE_PREFIX = 's_';

export default function importAliasPlugin(config: ImportAliasPluginOptions): Plugin {
  const checkedModules = Object.keys(config);
  const transforms: AppliedTransform[] = [];
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
          if (
            classDef?.superclass?.package &&
            checkedModules.includes(classDef?.superclass?.package)
          ) {
            const mTransform = applySuperclassTransformMangleClass(classDef, moduleDoc, config);
            if (mTransform) {
              transforms.push(mTransform);
            }
          }
      }
    },
    moduleLinkPhase({ moduleDoc, context }) {
      // debugger;
      // // PoC: Change superclass here to account for changing names
      // // Can we just change the name of all classes?
      // const anotherDeclaration = moduleDoc.declarations?.find(
      // ({ name }) => name === 'AnotherElement',
      // );
      // if (anotherDeclaration && anotherDeclaration.kind === 'class') {
      // anotherDeclaration!.superclass!.name = `${namespacePrefix}MyElement`;
      // }
    },
    // Runs after modules have been parsed and after post-processing
    packageLinkPhase({ customElementsManifest, context }) {
      debugger;
      transforms.forEach((transform) => reverseTransform(transform, customElementsManifest));
      // TODO: Handle package vs module
      // TODO: Need to account for changed names if other source files import your module we change
    },
  };
}

/**
 * Reverse the transformation applied to the class definition and export, reversing the mangled classname and changed superclass name.
 * @remarks
 * Doesn't reverse the change to `inheritedFrom` information for class members.
 * @param transform - The transform applied to the class definition to reverse.
 * @param manifest - The manifest containing the class definition and export to reverse.
 * @returns void
 * @throws Error - If the class definition, export, or module cannot be found. This should not be possible.
 */
export function reverseTransform(transform: AppliedTransform, manifest: Package) {
  const { path, class: className, superclass, package: pkg } = transform;
  const mModule = manifest.modules?.find((module) => module.path === path);
  const mDeclaration = mModule?.declarations?.find(
    (declaration) =>
      'superclass' in declaration &&
      declaration.name === `${NAMESPACE_PREFIX}${className}` &&
      declaration.superclass?.package === pkg,
  ) as ClassDeclaration | CustomElementDeclaration | undefined;
  const mExport = mModule?.exports?.find(
    ({ name, declaration }) =>
      name === `${NAMESPACE_PREFIX}${className}` && declaration.module === path,
  );
  if (!mModule || !mDeclaration || !mExport) {
    throw new Error('Could not find the transformed class definition, export, or module.');
  }
  mDeclaration.name = className;
  mDeclaration.superclass!.name = superclass;
  mExport.name = className;
  mExport.declaration!.name = className;
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
  const mNewSuperclassName =
    importConfig.override?.[name] ||
    (() => {
      const mNewName = importConfig['*']?.(name);
      return mNewName === name ? undefined : mNewName;
    })();
  // Require to update the export name to match or one of the analyzer base systems will cull the definition.
  // If there is no export then we bail now, as that definition is culled anyway.
  const moduleExport = moduleDoc.exports?.find(
    ({ name: exportName }) => exportName === classDef.name,
  );
  if (!mNewSuperclassName || !moduleExport) return null;

  const transform: AppliedTransform = {
    path: moduleDoc.path!,
    class: classDef.name,
    package: pkg!,
    superclass: classDef.superclass.name,
  };

  classDef.superclass!.name = mNewSuperclassName;
  classDef.name = `${NAMESPACE_PREFIX}${classDef.name}`;
  moduleExport!.name = classDef.name;
  moduleExport!.declaration!.name = classDef.name;
  return transform;
}
