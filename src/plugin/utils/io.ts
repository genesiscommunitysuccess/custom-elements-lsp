import { CompilerHost } from "typescript/lib/tsserverlibrary";

export interface IO {
  readFile(path: string): string | undefined;
}

/**
 * Uses methods on the typescript compiler host to perform IO operations.
 * // Info 29   [10:43:18.627] [CE] dir: /Users/matt.walker/genesis/poc/customelement-lsp/example/src
 * const dir = ts.createCompilerHost({}).getCurrentDirectory();
 */
export class TypescriptCompilerIOService implements IO {
  constructor(
    private compilerHost: CompilerHost,
    private projectRootOffset: string
  ) {
    console.log(
      `[CE] offset: ${
        this.projectRootOffset
      }, dir: ${compilerHost.getCurrentDirectory()}, $HOME: ${compilerHost.getEnvironmentVariable?.(
        "HOME"
      )}, default lib location: ${compilerHost.getDefaultLibLocation?.()}`
    );
  }

  readFile(path: string): string | undefined {
    return this.compilerHost.readFile(
      this.compilerHost.getDefaultLibLocation?.() +
        "/" +
        this.projectRootOffset +
        "/" +
        path
    );
  }
}
