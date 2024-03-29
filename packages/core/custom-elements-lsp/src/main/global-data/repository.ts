import { Logger } from 'typescript-template-language-service-decorator';
import { GLOBAL_ATTR } from './data/attributes';
import * as GlobalAriaAttributes from './data/attributes-aria';
import * as GlobalAttributesEvents from './data/events';
import { HTML_ATTRS } from './data/html-attributes';
import { GLOBAL_HTML_ELEMENTS } from './data/tagnames';
import {
  GlobalAttrType,
  GlobalDataInfo,
  GlobalDataRepository,
  PlainElementAttribute,
} from './global-data.types';

export class GlobalDataRepositoryImpl implements GlobalDataRepository {
  constructor(private logger: Logger) {
    this.init();
    this.logger.log('Setting up GlobalDataRepositoryImpl');
  }

  private globalAttributes: [string, GlobalAttrType][] = [];
  private ariaAttributes: string[] = [];
  private globalEvents: string[] = [];
  private globalHTMTags: string[] = [];

  private init() {
    this.globalAttributes = Object.entries(GLOBAL_ATTR);
    this.globalEvents = [...Object.values(GlobalAttributesEvents)];
    this.ariaAttributes = [...Object.values(GlobalAriaAttributes)];
    this.globalHTMTags = [...Object.keys(GLOBAL_HTML_ELEMENTS)];
  }

  getAttributes(): [string, GlobalAttrType][] {
    return this.globalAttributes;
  }

  getAriaAttributes(): string[] {
    return this.ariaAttributes;
  }

  getEvents(): string[] {
    return this.globalEvents;
  }

  getHTMLElementTags(): string[] {
    return this.globalHTMTags;
  }

  getHTMLAttributes(tagName: string): PlainElementAttribute[] {
    if (!(tagName in HTML_ATTRS)) return [];
    const attrs = HTML_ATTRS[tagName];
    return attrs.map(({ name, type, desc, deprecated }) => ({
      name,
      type,
      description: desc,
      deprecated,
    }));
  }

  getHTMLInfo(tagName: string): GlobalDataInfo | undefined {
    if (!(tagName in GLOBAL_HTML_ELEMENTS)) return undefined;
    return {
      tagName,
      description: GLOBAL_HTML_ELEMENTS[tagName].desc,
    };
  }
}
