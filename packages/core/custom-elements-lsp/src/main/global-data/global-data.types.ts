import { CustomElementAttribute } from '../custom-elements/custom-elements.types';

export type HTMLAttrType = 'string' | 'boolean';
export type GlobalAttrType = HTMLAttrType | 'wildcard';
export type GlobalDataInfo = { tagName: string; description: string };

export type PlainElementAttribute = Required<Omit<CustomElementAttribute, 'referenceClass'>>;

export interface GlobalDataService {
  getAriaAttributes(): string[];
  getAttributes(): [string, GlobalAttrType][];
  getEvents(): string[];
  getHTMLAttributes(tagName: string): PlainElementAttribute[];
  getHTMLElementTags(): string[];
  getHTMLInfo(tagName: string): GlobalDataInfo | undefined;
}

export interface GlobalDataRepository {
  getAriaAttributes(): string[];
  getAttributes(): [string, GlobalAttrType][];
  getEvents(): string[];
  getHTMLAttributes(tagName: string): PlainElementAttribute[];
  getHTMLElementTags(): string[];
  getHTMLInfo(tagName: string): GlobalDataInfo | undefined;
}
