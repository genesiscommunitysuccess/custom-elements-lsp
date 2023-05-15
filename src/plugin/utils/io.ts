import { Logger } from "typescript-template-language-service-decorator";
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

export class NodeIOService {
  constructor(private logger: Logger) {
    this.logger.log("Setting up Node IO Service");
    const dir = __dirname;
    const { path, relative, dirname } = require("node:path");
    this.logger.log(`dir: ${dir}`);
    this.logger.log(`__dirname: ${__dirname}`);
    this.logger.log(`cwd: ${process.cwd()}`);
    this.logger.log(`Relative: ${relative(__dirname, process.cwd())}`);
    this.logger.log(
      `Relative project: ${relative(__dirname, process.cwd() + "/../")}`
    );
    this.logger.log(`Found root: ${this.findProjectRoot()}`)
    // this.logger.log(`.: ${path.resolve('.')}`);
    // this.logger.log(`dirname: ${path.resolve(__dirname)}`);
  }

  private findProjectRoot(
    searchFile: string = "package.json"
  ): string | undefined {
    const curr = process.cwd();
    const { normalize } = require("node:path");
    const { existsSync } = require("fs");

    const findFile = (path: string): string | undefined => {
      const normalised = normalize(path + searchFile);
      if (existsSync(normalised)) {
        return normalize(path);
      } else if (normalised === `/${searchFile}`) {
        return undfined;
      }

      return findFile(path + "/../");
    };

    return findFile(curr);
  }
}
