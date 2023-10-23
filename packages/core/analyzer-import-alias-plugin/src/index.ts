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

export default function importAliasPlugin(
  config: ImportAliasPluginOptions
): Plugin & { name: string } {
  return {
    name: 'my-plugin',
    // Runs for all modules in a project, before continuing to the `analyzePhase`
    collectPhase({ ts, node, context }) {},
    // Runs for each module
    analyzePhase({ ts, node, moduleDoc, context }) {},
    // Runs for each module, after analyzing, all information about your module should now be available
    moduleLinkPhase({ moduleDoc, context }) {},
    // Runs after modules have been parsed and after post-processing
    packageLinkPhase({ customElementsManifest, context }) {},
  };
}
