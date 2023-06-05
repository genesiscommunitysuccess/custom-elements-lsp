import { GlobalAttrType, GlobalDataRepository } from "./global-data.types";

import * as GlobalAttributesEvents from "./data/events";
import * as GlobalAriaAttributes from "./data/attributes-aria";
import { Logger } from "typescript-template-language-service-decorator";
import { GLOBAL_ATTR } from "./data/attributes";

export class GlobalDataRepositoryImpl implements GlobalDataRepository {
  constructor(private logger: Logger) {
    this.init();
    logger.log("Setting up GlobalDataRepositoryImpl");
  }

  private globalAttributes: [string, GlobalAttrType][] = [];
  private ariaAttributes: string[] = [];
  private globalEvents: string[] = [];

  private init() {
    this.globalAttributes = Object.entries(GLOBAL_ATTR);
    this.globalEvents = [...Object.values(GlobalAttributesEvents)];
    this.ariaAttributes = [...Object.values(GlobalAriaAttributes)];
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
}
