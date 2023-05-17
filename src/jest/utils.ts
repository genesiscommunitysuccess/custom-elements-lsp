import {
  Logger,
  TemplateContext,
} from "typescript-template-language-service-decorator";
import { GlobalDataRepositoryImpl } from "../plugin/global-data/repository";
import { GlobalDataServiceImpl } from "../plugin/global-data/service";
import { Services } from "../plugin/utils/services.type";
import { getCEServiceFromTestJsonResource } from "./custom-elements";

const constructLogger = (debugLog: boolean = false): Logger => ({
  log: (msg: string) => {
    debugLog && console.log(`[debug-log] ${msg}`);
  },
});

export const getGlobalDataService = () =>
  new GlobalDataServiceImpl(
    getLogger(),
    new GlobalDataRepositoryImpl(getLogger())
  );

export const buildServices = (overrides: Partial<Services>): Services => ({
  customElements: getCEServiceFromTestJsonResource({}),
  globalData: getGlobalDataService(),
  ...overrides,
});

/**
/**
 * Construct a logger which will output debug logs if the `TEST_LOG` environment
 * variable is set to `1`. Use via `npm run test:unit:verbose`.
 */
export function getLogger() {
  const debugLog = process.env.TEST_LOG === "1";
  return constructLogger(debugLog);
}

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
  const rawText = String.raw({ raw: strings }, ...values) ?? "";

  return {
    typescript: jest.fn() as any,
    fileName: "test.ts",
    text:
      String.raw(
        { raw: strings },
        ...values.map((v) => "x".repeat(v.toString().length))
      ) ?? "",
    rawText,
    node: {
      getSourceFile: () => "test.ts",
    } as any,
    toOffset: toOffset(rawText),
    toPosition: jest.fn(),
  };
};

export function expectArrayElements(expected: any[], actual: any[]): void {
  expect(expected.sort()).toEqual(actual.sort());
}
