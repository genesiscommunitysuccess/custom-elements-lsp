import { CustomElementAttribute } from '../custom-elements/custom-elements.types';

export type HTMLAttrType = 'string' | 'boolean';
export type GlobalAttrType = HTMLAttrType | 'wildcard';

export type PlainElementAttribute = Required<
  Omit<CustomElementAttribute, 'referenceClass' | 'deprecated'>
>;

export interface GlobalDataService {
  getAriaAttributes(): string[];
  getAttributes(): [string, GlobalAttrType][];
  getEvents(): string[];
  getHTMLElementTags(): string[];
  getHTMLAttributes(tagName: string): PlainElementAttribute[];
}

export interface GlobalDataRepository {
  getAriaAttributes(): string[];
  getAttributes(): [string, GlobalAttrType][];
  getEvents(): string[];
  getHTMLElementTags(): string[];
  getHTMLAttributes(tagName: string): PlainElementAttribute[];
}
