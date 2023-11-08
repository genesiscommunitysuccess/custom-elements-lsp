import { CEPPlugin } from '@genesiscommunitysuccess/custom-elements-lsp';

const fastPlugin: CEPPlugin = (logger, services) => {
  logger.log('fastPlugin');
  return {};
};

export default fastPlugin;
