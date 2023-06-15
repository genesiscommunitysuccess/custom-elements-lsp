export interface IOService {
  fileExists(path: string): boolean;
  getLocationOfStringInFile(path: string, token: string): number | null;
  getNormalisedRootPath(): string;
  readFile(path: string): string | undefined;
}

export interface IORepository {
  fileExists(path: string): boolean;
  getNormalisedRootPath(): string;
  readFile(path: string): string | undefined;
}
