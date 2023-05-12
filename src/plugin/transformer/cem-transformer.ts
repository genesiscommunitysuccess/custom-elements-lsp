import {
  CustomElement,
  CustomElementDeclaration,
  JavaScriptModule,
  Package,
} from "custom-elements-manifest";
import { Logger } from "typescript-template-language-service-decorator";
import {
  CustomElementAttribute,
  CustomElementsResource,
} from "./custom-elements-resource";

export type CEMTConfig = {
  designSystemPrefix?: string;
};

export class CustomElementsManifestTransformer
  implements CustomElementsResource {
  private customElementsDefinition: Map<string, CustomElementDeclaration> =
    new Map();

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

    this.customElementsDefinition.set(
      tagName,
      declaration as CustomElementDeclaration
    );
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
    this.customElementsDefinition.set(
      name,
      declaration as CustomElementDeclaration
    );
    return true;
  }

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
}
