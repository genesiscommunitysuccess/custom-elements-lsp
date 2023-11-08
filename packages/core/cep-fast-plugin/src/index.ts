import { CEPPlugin } from '@genesiscommunitysuccess/custom-elements-lsp';
import { FASTCompletionsService } from './completions';
import { FASTDiagnosticsService } from './diagnostics';
import { FASTMetadataService } from './metadata';

const fastPlugin: CEPPlugin = (logger, services) => {
  logger.log('fastPlugin');
  return {
    completions: [new FASTCompletionsService(logger, services)],
    diagnostics: [new FASTDiagnosticsService(logger, services)],
    metadata: [new FASTMetadataService(logger, services)],
  };
};

export default fastPlugin;
