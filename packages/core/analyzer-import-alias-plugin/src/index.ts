import { Plugin } from '@custom-elements-manifest/analyzer';
import type {
  ClassDeclaration,
  Reference,
  Module,
  Package,
  CustomElementDeclaration,
} from 'custom-elements-manifest';
import { ClassDeclaration as TSClassDeclaration, SyntaxKind } from 'typescript';

/**
 * TECHNICAL OVERVIEW.
 *
 * 1. During the analyze phase, if we are on an AST node which is a class definition
 * we check to see if it has a superclass definition.
 * 2. If there is a superclass definition which is from an npm package then we check the plugin
 * config and apply a transform if required.
 * 3. Because a name transformation may end up making the superclass name the same as the class name,
 * we namespace all of the local classnames to avoid collisions. Because of this, if the superclass is
 * local then we need to namespace that too to ensure inheritance isn't broken.
 * 4. Performing the above steps will allow the analyzer to correctly form the inheritance chain as required.
 * However, we need to dis-apply the transforms to the manifest after the analyzer has finished, otherwise the classnames
 * will be exported not matching the code.
 */

const pluginName = 'analyzer-import-alias-plugin';

export type AppliedTransform = {
  class: string;
  path: string;
  package?: string;
  superclass?: string;
};

export type ImportAliasPluginOptions = {
  [moduleName: string]: {
    '*'?: (importName: string) => string;
    [key: string]: string | ((importName: string) => string) | undefined;
  };
};

// Used to namespace the classnames of local definitions to avoid collisions
export const NAMESPACE_PREFIX = '<local>_';

export default function importAliasPlugin(config: ImportAliasPluginOptions): Plugin {
  const transforms: AppliedTransform[] = [];
  return {
    name: pluginName,
    // Runs for all modules in a project, before continuing to the `analyzePhase`
    collectPhase() {},
    // Runs for each module
    analyzePhase({ node, moduleDoc }) {
      // Runs for each module, after analyzing, all information about your module should now be available
      switch (node.kind) {
        case SyntaxKind.ClassDeclaration:
          const classDeclarationNode = node as TSClassDeclaration;
          const className = classDeclarationNode.name?.getText();
          const classDef = moduleDoc.declarations?.find(
            ({ name, kind }) => name === className && kind === 'class',
          ) as ClassDeclaration | undefined;
          if (!classDef) return;

          const mNewSuperclassName = getNewSuperclassName(classDef, config);
          const mTransform = namespaceClassnameApplySuperclass(
            classDef,
            moduleDoc,
            mNewSuperclassName,
          );
          if (mTransform) {
            transforms.push(mTransform);
          }
      }
    },
    moduleLinkPhase({ moduleDoc, context }) {},
    // Runs after modules have been parsed and after post-processing
    packageLinkPhase({ customElementsManifest, context }) {
      transforms.forEach((transform) => reverseTransform(transform, customElementsManifest));
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
  const { path, class: className, superclass } = transform;
  const mModule = manifest.modules?.find((module) => module.path === path);
  const mDeclaration = mModule?.declarations?.find(
    (declaration) =>
      declaration.name === `${NAMESPACE_PREFIX}${className}` && declaration.kind === 'class',
  ) as ClassDeclaration | CustomElementDeclaration | undefined;
  const mExport = mModule?.exports?.find(
    ({ name, declaration }) =>
      name === `${NAMESPACE_PREFIX}${className}` && declaration.module === path,
  );
  if (!mModule || !mDeclaration || !mExport) {
    throw new Error('Could not find the transformed class definition, export, or module.');
  }
  mDeclaration.name = className;
  mExport.name = className;
  mExport.declaration!.name = className;
  if (mDeclaration.superclass && superclass) {
    mDeclaration.superclass!.name = superclass;
  }
}

/**
 * Get the new superclass name for the class definition, or null if not applicable.
 * @remarks
 * If the superclass is an npm package, then it is transformed/substituted if defined by the config.
 * If the superclass is a local definition, then we need to mangle the name to match any locally manged names.
 * name to ensure it doesn't equal the new superclass name.
 * @param classDef - The class definition containing the superclass defintiion to transform.
 * @param config - The plugin config containing a potential transform.
 * @returns string | null - The new superclass name, or null if not applicable.
 */
export function getNewSuperclassName(
  classDef: ClassDeclaration,
  config: ImportAliasPluginOptions,
): string | null {
  if (!classDef?.superclass?.package && !classDef?.superclass?.module) {
    return null;
  }
  // package = npm, module = local
  const { package: pkg, name, module } = classDef.superclass as Reference;

  if (pkg) {
    const importConfig = config[pkg as string] ?? {};
    return (
      (importConfig[name] as string) ||
      (() => {
        const catchAllReplacement = importConfig['*'];
        if (!catchAllReplacement) {
          return null;
        }
        const replacedName = catchAllReplacement(name);
        return replacedName !== name ? replacedName : null;
      })() ||
      null
    );
  } else if (module) {
    return `${NAMESPACE_PREFIX}${classDef.superclass.name}`;
  }
  return null;
}

/**
 * Namespace local classname and apply new superclass name, if required.
 * @remarks
 * Need to namespace the name of a class so that the transformed superclass name doesn't match.
 * If mNewSuperclassName is set, then we need to update the superclass to it.
 * @param classDef - The class definition containing the superclass defintiion to transform.
 * @param moduleDoc - The module doc containing the export definition which we need to change to match, or the definition will be culled.
 * @param mNewSuperclassName - The new superclass name, or null if not applicable.
 * @returns AppliedTransform - The transform applied to the class definition, used to reverse later. Or null if no transform was applied.
 */
export function namespaceClassnameApplySuperclass(
  classDef: ClassDeclaration,
  moduleDoc: Partial<Module>,
  mNewSuperclassName: string | null,
): AppliedTransform | null {
  const pkg = classDef.superclass?.package;
  // Require to update the export name to match or one of the analyzer base systems will cull the definition.
  // If there is no export then we bail now, as that definition is culled anyway.
  const moduleExport = moduleDoc.exports?.find(
    ({ name: exportName }) => exportName === classDef.name,
  );
  // if there is no export then this definition is culled anyway.
  if (!moduleExport) return null;

  const transform: AppliedTransform = {
    path: moduleDoc.path!,
    class: classDef.name,
    package: pkg,
    superclass: classDef?.superclass?.name,
  };

  classDef.name = `${NAMESPACE_PREFIX}${classDef.name}`;
  moduleExport!.name = classDef.name;
  moduleExport!.declaration!.name = classDef.name;
  if (classDef.superclass && mNewSuperclassName) {
    classDef!.superclass!.name = mNewSuperclassName;
  }
  return transform;
}
