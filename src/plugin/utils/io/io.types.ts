export interface IOService {
  readFile(path: string): string | undefined;
  getNormalisedRootPath(): string;
  getLocationOfStringInFile(path: string, token: string): number | null;
}

export interface IORepository {
  readFile(path: string): string | undefined;
  getNormalisedRootPath(): string;
}
