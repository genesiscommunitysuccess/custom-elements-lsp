import { Logger } from 'typescript-template-language-service-decorator';
import * as jestUtils from '../../jest/';
import * as DIAGNOSTIC_CODES from '../constants/diagnostic-codes';
import { getStore } from '../utils/kvstore';
import * as strings from '../utils/strings';

export type { CEPPlugin } from '../plugins/plugins.types';
export type { CompletionCtx, PartialCompletionsService } from '../completions/completions.types';
export type { Services } from '../utils/services.types';
export type { PartialDiagnosticsService, DiagnosticCtx } from '../diagnostics/diagnostics.types';
export type { PartialMetadataService, QuickInfoCtx } from '../metadata/metadata.types';
export type {
  CustomElementAttribute,
  CustomElementEvent,
  CustomElementMember,
  CustomElementDef,
  CustomElementsService,
} from '../custom-elements/custom-elements.types';
export type {
  GlobalDataService,
  HTMLAttrType,
  GlobalAttrType,
  GlobalDataInfo,
  PlainElementAttribute,
} from '../global-data/global-data.types';

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
export const testUtils = {
  ...jestUtils,
};
