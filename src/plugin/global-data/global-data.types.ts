export type GlobalAttrType = 'string' | 'boolean' | 'wildcard';

export interface GlobalDataService {
  getAttributes(): [string, GlobalAttrType][];
  getAriaAttributes(): string[];
  getEvents(): string[];
}

export interface GlobalDataRepository {
  getAttributes(): [string, GlobalAttrType][];
  getAriaAttributes(): string[];
  getEvents(): string[];
}
