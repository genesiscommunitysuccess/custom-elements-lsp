import { Logger } from 'typescript-template-language-service-decorator';
import { GLOBAL_ATTR } from './data/attributes';
import * as GlobalAriaAttributes from './data/attributes-aria';
import * as GlobalAttributesEvents from './data/events';
import * as GlobalHTMLTags from './data/tagnames';
import { GlobalAttrType, GlobalDataRepository } from './global-data.types';

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
    this.globalHTMTags = [...Object.values(GlobalHTMLTags)];
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
}
