export type GlobalAttrType = 'string' | 'boolean' | 'wildcard';

export interface GlobalDataService {
  getAriaAttributes(): string[];
  getAttributes(): [string, GlobalAttrType][];
  getEvents(): string[];
  getHTMLElementTags(): string[];
}

export interface GlobalDataRepository {
  getAriaAttributes(): string[];
  getAttributes(): [string, GlobalAttrType][];
  getEvents(): string[];
  getHTMLElementTags(): string[];
}
