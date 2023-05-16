import { GlobalDataRepository } from "./global-data.types";

import * as GlobalAttributes from "./data/attributes";
import * as GlobalAttributesEvents from "./data/events";
import { Logger } from "typescript-template-language-service-decorator";

export class GlobalDataRepositoryImpl implements GlobalDataRepository {
  constructor(private logger: Logger) {
    this.init();
    logger.log("Setting up GlobalDataRepositoryImpl");
  }

  private globalAttributes: string[] = [];

  private init() {
    this.globalAttributes = [
      ...Object.values(GlobalAttributes),
      ...Object.values(GlobalAttributesEvents),
    ];
  }

  getAttributes(): string[] {
    return this.globalAttributes;
  }
}
