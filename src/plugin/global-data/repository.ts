import { GlobalDataRepository } from "./global-data.types";

import * as GlobalAttributes from "./data/attributes";
import * as GlobalAttributesEvents from "./data/events";
import * as GlobalAriaAttributes from "./data/attributes-aria";
import { Logger } from "typescript-template-language-service-decorator";

export class GlobalDataRepositoryImpl implements GlobalDataRepository {
  constructor(private logger: Logger) {
    this.init();
    logger.log("Setting up GlobalDataRepositoryImpl");
  }

  private globalAttributes: string[] = [];
  private ariaAttributes: string[] = [];

  private init() {
    this.globalAttributes = [
      ...Object.values(GlobalAttributes),
      ...Object.values(GlobalAttributesEvents),
    ];

    this.ariaAttributes = [...Object.values(GlobalAriaAttributes)];
  }

  getAttributes(): string[] {
    return this.globalAttributes;
  }

  getAriaAttributes(): string[] {
    return this.ariaAttributes;
  }
}
