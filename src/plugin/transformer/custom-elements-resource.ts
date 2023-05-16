export interface CustomElementsResource {
  getCENames(): string[];
  getCEAttributes(name: string): CustomElementAttribute[];
  getCEInfo(config: GetCEInfo): CEInfo[];
}

export type GetCEInfo = {
  getFullPath: boolean; // Return full path if true e.g. `node_modules/@microsoft/fast-foundation/Button`, else the package or path
}

export type CEInfo = {
  tagName: string;
  path: string;
}

export type CustomElementAttribute = {
  name: string; // Attribute name rather than associated field if available
  type: string;
};
