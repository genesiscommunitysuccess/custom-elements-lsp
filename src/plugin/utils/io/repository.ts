import * as nodepath from 'path';
import { Logger } from 'typescript-template-language-service-decorator';
import { CompilerHost } from 'typescript/lib/tsserverlibrary';
import { IORepository } from './io.types';

/**
 * Uses methods on the typescript compiler host to perform IO operations.
 * // Info 29   [10:43:18.627] [CE] dir: /Users/matt.walker/genesis/poc/customelement-lsp/example/src
 * const dir = ts.createCompilerHost({}).getCurrentDirectory();
 */
export class TypescriptCompilerIORepository implements IORepository {
  constructor(
    private logger: Logger,
    private compilerHost: CompilerHost,
    private projectRootOffset: string
  ) {
    this.logger.log('setting up TypescriptCompilerIORepository');
  }

  getNormalisedRootPath(): string {
    return nodepath.normalize(
      this.compilerHost.getDefaultLibLocation?.() + '/' + this.projectRootOffset + '/'
    );
  }

  readFile(path: string): string | undefined {
    return this.compilerHost.readFile(
      this.compilerHost.getDefaultLibLocation?.() + '/' + this.projectRootOffset + '/' + path
    );
  }
}
