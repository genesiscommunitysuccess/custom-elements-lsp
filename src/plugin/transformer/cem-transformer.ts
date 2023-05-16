import {
  CustomElement,
  CustomElementDeclaration,
  JavaScriptModule,
  Package,
} from "custom-elements-manifest";
import { Logger } from "typescript-template-language-service-decorator";
import {
  CEInfo,
  CustomElementAttribute,
  CustomElementsResource,
  GetCEInfo,
} from "./custom-elements-resource";

export type CEMTConfig = {
  designSystemPrefix?: string;
};

interface CustomElementDef extends CustomElementDeclaration {
  path: string;
}

const PARSE_PATH_REGEXP =
  /node_modules\/(?:(?:(@[^\/]+\/[^\/]+))|(?:([^\/]+)\/))/;

export class CustomElementsManifestTransformer
  implements CustomElementsResource {
  private customElementsDefinition: Map<string, CustomElementDef> = new Map();

  constructor(
    private logger: Logger,
    private manifest: Package,
    private config: CEMTConfig
  ) {
    this.tranfsormManifest();
    logger.log(
      `Setting up CustomElementsManifestTransformer class with config ${JSON.stringify(
        config
      )}`
    );
  }

  /**
   * PARSE
   */

  private tranfsormManifest() {
    this.logger.log(`tranfsormManifest: ${JSON.stringify(this.manifest)}`);

    // TODO: Only supports FAST @customElements export in same file
    // TODO: Support mixin custom elements
    for (const module of this.manifest.modules) {
      if (this.parseRegisterExportedCustomElement(module)) continue;
      this.parseRegisterComposedCustomElement(module);
    }

    this.logger.log(
      `webComponentNames: ${JSON.stringify([
        ...this.customElementsDefinition.keys(),
      ])}`
    );
  }

  /**
   * Parses an export which is a class that is composed and later registered with a
   * design system. Expects the tagName to have `%%prefix%%-` which is a placeholder
   * for the design system prefix.
   */
  private parseRegisterComposedCustomElement(
    module: JavaScriptModule
  ): boolean {
    const declaration = module.declarations?.filter(
      (d) =>
        d.kind === "class" &&
        "customElement" in d &&
        d.customElement &&
        "tagName" in d
    )[0] as CustomElement | undefined;

    if (declaration === undefined) return false;

    this.logger.log(`composed declaration: ${JSON.stringify(declaration)}`);

    // We know it has a tagName as we checked in the filter
    const baseTag = (declaration as { tagName: string }).tagName;

    const tagName = this.config.designSystemPrefix
      ? baseTag.replace("%%prefix%%", this.config.designSystemPrefix)
      : baseTag;

    this.customElementsDefinition.set(tagName, {
      ...(declaration as CustomElementDef),
      path: module.path,
    });
    return true;
  }

  /**
   * Parses a custom element export which is a defined and registered custom element
   */
  private parseRegisterExportedCustomElement(
    module: JavaScriptModule
  ): boolean {
    const name = module.exports?.filter(
      (m) => m.kind === "custom-element-definition"
    )[0]?.name;

    if (!name) return false;

    this.logger.log(`name: ${JSON.stringify(name)}`);

    const declaration = module.declarations?.filter(
      (d) => d.kind === "class" && "customElement" in d && d.customElement
    )[0];

    this.logger.log(`declaration: ${JSON.stringify(declaration)}`);

    if (!declaration) return false;

    // If the declaration has kind === "class" and customElement is true, then it is a custom element
    this.customElementsDefinition.set(name, {
      ...(declaration as CustomElementDef),
      path: module.path,
    });
    return true;
  }

  /**
   * IMPLEMENTS CustomElementsResource
   */

  getCEAttributes(name: string): CustomElementAttribute[] {
    const definition = this.customElementsDefinition.get(name);
    if (!definition || !definition.attributes) return [];

    return definition.attributes.map((a) => ({
      name: a.name ?? a.fieldName,
      type: a.type?.text ?? "string",
    }));
  }

  getCENames(): string[] {
    return [...this.customElementsDefinition.keys()];
  }

  getCEInfo(config: GetCEInfo): CEInfo[] {
    const info: CEInfo[] = [];
    for (const [k, v] of this.customElementsDefinition) {
      info.push({
        tagName: k,
        path: this.processPath(v.path, config.getFullPath),
      });
    }
    return info;
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
