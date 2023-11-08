import { Logger } from 'typescript-template-language-service-decorator';
import * as DIAGNOSTIC_CODES from '../constants/diagnostic-codes';
import { getStore } from '../utils/kvstore';
import * as strings from '../utils/strings';

export const utils = {
  strings,
  getStore: (logger: Logger) => {
    // Can't export getStore directly as typescript doesn't let you export
    // access to a class with private fields as that isn't in the .d.ts files
    const s = getStore(logger);
    return {
      clearCache: s.clearCache.bind(s),
      getOrAdd: s.getOrAdd.bind(s),
      TSUnsafeGetOrAdd: s.TSUnsafeGetOrAdd.bind(s),
    };
  },
};
export const CONSTANTS = {
  DIAGNOSTIC_CODES,
};
