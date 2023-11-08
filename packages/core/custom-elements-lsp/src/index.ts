import { init } from './plugin';

export type { CEPPlugin } from './plugins/plugins.types';

// Needs to be this or
// "Skipped loading plugin @genesiscommunitysuccess/custom-elements-lsp because it did not expose a proper factory function"
module.exports = init;
