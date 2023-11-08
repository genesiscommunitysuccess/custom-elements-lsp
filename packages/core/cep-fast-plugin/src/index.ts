import { CEPPlugin } from '@genesiscommunitysuccess/custom-elements-lsp';
import { FASTCompletionsService } from './completions';

const fastPlugin: CEPPlugin = (logger, services) => {
  logger.log('fastPlugin');
  return {
    completions: [new FASTCompletionsService(logger, services)],
  };
};

export default fastPlugin;
