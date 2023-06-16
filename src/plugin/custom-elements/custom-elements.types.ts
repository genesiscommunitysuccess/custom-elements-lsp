import { CustomElementDeclaration, Privacy } from 'custom-elements-manifest';

// RAW DATA
export interface CustomElementsResource {
  data: Map<string, CustomElementDef>;
  getConfig: () => CEMTConfig;
}

export interface CustomElementDef extends CustomElementDeclaration {
  path: string;
}

// RESOURCE

export interface CustomElementsService {
  customElementKnown(tagName: string): boolean;
  getAllCEInfo(config: GetCEInfo): CEInfo[];
  getAllEvents(): CustomElementEvent[];
  getCEAttributes(name: string): CustomElementAttribute[];
  getCEDefinitionName(name: string): string | null;
  getCEEvents(name: string): CustomElementEvent[];
  getCEMembers(name: string): CustomElementMember[];
  getCENames(): string[];
  getCEPath(name: string, config: Pick<GetCEInfo, 'getFullPath'>): string | null;
}

export type CEMTConfig = {
  designSystemPrefix?: string;
};

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
