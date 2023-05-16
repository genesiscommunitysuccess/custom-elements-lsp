import {
  CustomElement,
  JavaScriptModule,
  Package,
} from "custom-elements-manifest";
import { Logger } from "typescript-template-language-service-decorator";
import {
  CustomElementDef,
  CustomElementsResource,
} from "./custom-elements-resource";

export type CEMTConfig = {
  designSystemPrefix?: string;
};

export class CustomElementsAnalyzerManifestParser
  implements CustomElementsResource {
  constructor(
    private logger: Logger,
    private manifest: Package,
    private config: CEMTConfig
  ) {
    this.tranfsormManifest();
    logger.log(
      `Setting up CustomElementsAnalyzerManifestParser class with config ${JSON.stringify(
        config
      )}`
    );
  }

  /**
   * API
   */
  data: Map<string, CustomElementDef> = new Map();

  /**
   * PRIVATE
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
      `webComponentNames: ${JSON.stringify([...this.data.keys()])}`
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

    this.data.set(tagName, {
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
    this.data.set(name, {
      ...(declaration as CustomElementDef),
      path: module.path,
    });
    return true;
  }
}
