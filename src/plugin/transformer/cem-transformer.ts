import { CustomElementDeclaration, Package } from "custom-elements-manifest";
import { Logger } from "typescript-template-language-service-decorator";
import {
  CustomElementAttribute,
  CustomElementsResource,
} from "./custom-elements-resource";

export class CustomElementsManifestTransformer
  implements CustomElementsResource {
  private customElementsDefinition: Map<string, CustomElementDeclaration> =
    new Map();

  constructor(
    private logger: Logger,
    private manifest: Package
  ) {
    this.tranfsormManifest();
    logger.log(`Setting up CustomElementsManifestTransformer class`);
  }

  private tranfsormManifest() {
    this.logger.log(`tranfsormManifest: ${JSON.stringify(this.manifest)}`);

    // TODO: Only supports FAST @customElements export in same file
    // TODO: Support mixin custom elements
    this.manifest.modules.forEach((module) => {
      const name = module.exports?.filter(
        (m) => m.kind === "custom-element-definition"
      )[0]?.name;

      if (!name) return;

      this.logger.log(`name: ${JSON.stringify(name)}`);

      const declaration = module.declarations?.filter(
        (d) => d.kind === "class" && "customElement" in d && d.customElement
      )[0];

      this.logger.log(`declaration: ${JSON.stringify(declaration)}`);

      if (!declaration) return;

      // If the declaration has kind === "class" and customElement is true, then it is a custom element
      this.customElementsDefinition.set(
        name,
        declaration as CustomElementDeclaration
      );
    });

    this.logger.log(
      `webComponentNames: ${JSON.stringify([
        ...this.customElementsDefinition.keys(),
      ])}`
    );
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
