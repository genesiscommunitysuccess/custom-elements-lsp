import { IORepository, IOService } from './io.types';

export class IOServiceImpl implements IOService {
  constructor(private repo: IORepository) {
    // console.log(
    // `[CE] offset: ${this.projectRootOffset
    // }, dir: ${compilerHost.getCurrentDirectory()}, $HOME: ${compilerHost.getEnvironmentVariable?.(
    // 'HOME'
    // )}, default lib location: ${compilerHost.getDefaultLibLocation?.()}`
    // );
  }

  fileExists(path: string): boolean {
    return this.repo.fileExists(path);
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
