import { CustomElementDeclaration, Privacy } from 'custom-elements-manifest';

// RAW DATA
export interface CustomElementsResource {
  data: Map<string, CustomElementDef>;
}

export interface CustomElementDef extends CustomElementDeclaration {
  path: string;
}

// RESOURCE

export interface CustomElementsService {
  customElementKnown(tagName: string): boolean;
  getCEAttributes(name: string): CustomElementAttribute[];
  getCEEvents(name: string): CustomElementEvent[];
  getCEInfo(config: GetCEInfo): CEInfo[];
  getCEMembers(name: string): CustomElementMember[];
  getCENames(): string[];
}

export type GetCEInfo = {
  getFullPath: boolean; // Return full path if true e.g. `node_modules/@microsoft/fast-foundation/Button`, else the package or path
};

export type CEInfo = {
  tagName: string;
  path: string;
};

export type CustomElementAttribute = {
  name: string; // Attribute name rather than associated field if available
  type: string;
  referenceClass?: string;
  deprecated: boolean;
};

export type CustomElementEvent = {
  name: string;
  type: string;
  referenceClass?: string;
};

export type CustomElementMember = CustomElementAttribute & {
  isStatic?: boolean;
  privacy?: Privacy;
};
