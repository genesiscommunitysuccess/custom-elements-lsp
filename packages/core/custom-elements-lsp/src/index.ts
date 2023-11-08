import { init } from './plugin';

// Should these also be in the other file?
export type { CEPPlugin } from './plugins/plugins.types';
export type { CompletionCtx, PartialCompletionsService } from './completions/completions.types';
export type { Services } from './utils/services.types';
export { PartialDiagnosticsService, DiagnosticCtx } from './diagnostics/diagnostics.types';
export { PartialMetadataService, QuickInfoCtx } from './metadata/metadata.types';
export {
  CustomElementAttribute,
  CustomElementEvent,
  CustomElementMember,
  CustomElementDef,
} from './custom-elements/custom-elements.types';

// Needs to be this or
// "Skipped loading plugin @genesiscommunitysuccess/custom-elements-lsp because it did not expose a proper factory function"
module.exports = init;
