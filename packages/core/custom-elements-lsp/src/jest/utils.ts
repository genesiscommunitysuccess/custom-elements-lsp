import { LineAndCharacter } from 'typescript';
import { Logger, TemplateContext } from 'typescript-template-language-service-decorator';
import { GlobalDataRepositoryImpl } from '../main/global-data/repository';
import { GlobalDataServiceImpl } from '../main/global-data/service';
import { Services } from '../main/utils/services.types';
import { getCEServiceFromStubbedResource } from './custom-elements';
import { getIOServiceFromStubResource } from './io';

const constructLogger = (debugLog: boolean = false): Logger => ({
  log: (msg: string) => {
    debugLog && console.log(`[debug-log] ${msg}`);
  },
});

export const getGlobalDataService = () =>
  new GlobalDataServiceImpl(getLogger(), new GlobalDataRepositoryImpl(getLogger()));

export const buildServices = (overrides: Partial<Services>): Services => ({
  servicesReady: () => true,
  io: getIOServiceFromStubResource({}),
  customElements: getCEServiceFromStubbedResource(),
  globalData: getGlobalDataService(),
  ...overrides,
});

/**
 * Construct a logger which will output debug logs if the `TEST_LOG` environment
 * variable is set to `1`. Use via `npm run test:unit:verbose`.
 */
export function getLogger() {
  const debugLog = process.env.TEST_LOG === '1';
  return constructLogger(debugLog);
}

const toPosition =
  (rawText: string) =>
  (offset: number): LineAndCharacter => {
    let rest = offset;
    let line = 0;
    const lines = rawText.split(/\n/g);
    while (rest > lines[line].length) {
      rest -= lines[line].length + 1;
      line += 1;
    }
    return { line, character: rest };
  };

const toOffset =
  (rawText: string) =>
  ({ line, character }: { line: number; character: number }) =>
    rawText
      .split(/\n/g)
      .slice(0, line)
      .reduce((acc, curr) => acc + curr.length + 1, 0) + character;

/**
 * Tagged template literal which is converted to TemplateContext
 * for use in the unit tests
 */
export const html = (
  strings: TemplateStringsArray,
  ...values: ((...args: any[]) => any)[]
): TemplateContext => {
  const rawText = String.raw({ raw: strings }, ...values.map((v) => '${' + v + '}')) ?? '';

  return {
    typescript: { _info: 'not implemented' } as any,
    fileName: 'test.ts',
    text: String.raw({ raw: strings }, ...values.map((v) => 'x'.repeat(v.toString().length))) ?? '',
    rawText,
    node: {
      getSourceFile: () => 'test.ts',
    } as any,
    toOffset: toOffset(rawText),
    toPosition: toPosition(rawText),
  };
};

export function expectArrayElements(expected: any[], actual: any[]): void {
  expect(expected.sort()).toEqual(actual.sort());
}
