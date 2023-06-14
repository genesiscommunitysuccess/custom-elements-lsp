import { IORepository, IOService } from './io.types';

/**
 * Uses methods on the typescript compiler host to perform IO operations.
 * // Info 29   [10:43:18.627] [CE] dir: /Users/matt.walker/genesis/poc/customelement-lsp/example/src
 * const dir = ts.createCompilerHost({}).getCurrentDirectory();
 */
export class IOServiceImpl implements IOService {
  constructor(private repo: IORepository) {
    // console.log(
    // `[CE] offset: ${this.projectRootOffset
    // }, dir: ${compilerHost.getCurrentDirectory()}, $HOME: ${compilerHost.getEnvironmentVariable?.(
    // 'HOME'
    // )}, default lib location: ${compilerHost.getDefaultLibLocation?.()}`
    // );
  }

  readFile(path: string): string | undefined {
    return this.repo.readFile(path);
  }

  getNormalisedRootPath(): string {
    return this.repo.getNormalisedRootPath();
  }

  getLocationOfStringInFile(path: string, token: string): number | null {
    const file = this.readFile(path);
    if (!file) {
      return null;
    }
    return file.indexOf(token);
  }
}
