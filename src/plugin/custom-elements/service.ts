import { Logger } from "typescript-template-language-service-decorator";
import {
  CEInfo,
  CustomElementAttribute,
  CustomElementEvent,
  CustomElementsResource,
  CustomElementsService,
  GetCEInfo,
} from "./custom-elements.types";

const PARSE_PATH_REGEXP =
  /node_modules\/(?:(?:(@[^\/]+\/[^\/]+))|(?:([^\/]+)\/))/;

export class CustomElementsServiceImpl implements CustomElementsService {
  constructor(private logger: Logger, private ceData: CustomElementsResource) {
    logger.log("Setting up CustomElementsServiceImpl");
  }

  getCEAttributes(name: string): CustomElementAttribute[] {
    const definition = this.ceData.data.get(name);
    if (!definition || !definition.attributes) return [];

    return definition.attributes.map((a) => ({
      name: a.name ?? a.fieldName,
      type: a.type?.text ?? "any",
      referenceClass: a.inheritedFrom?.name ?? definition.name,
    }));
  }

  getCEEvents(name: string): CustomElementEvent[] {
    const definition = this.ceData.data.get(name);
    if (!definition || !definition.events) return [];

    return definition.events.map((a) => ({
      name: a.name,
      type: a.type?.text ?? a.description ?? 'any',
      referenceClass: a.inheritedFrom?.name ?? definition.name,
    }));
  }

  getCENames(): string[] {
    return [...this.ceData.data.keys()];
  }

  getCEInfo(config: GetCEInfo): CEInfo[] {
    const info: CEInfo[] = [];
    for (const [k, v] of this.ceData.data) {
      info.push({
        tagName: k,
        path: this.processPath(v.path, config.getFullPath),
      });
    }
    return info;
  }

  customElementKnown(tagName: string): boolean {
    return this.ceData.data.has(tagName);
  }

  /**
   * PRIVATE
   */
  private processPath(path: string, getFullPath: boolean): string {
    if (getFullPath) {
      return path;
    }
    let matches = path.match(PARSE_PATH_REGEXP);
    if (matches === null) {
      return path;
    }
    return matches.slice(1).filter((m) => m)[0];
  }
}
