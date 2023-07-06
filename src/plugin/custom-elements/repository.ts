import { EventEmitter } from 'events';
import { CustomElement, JavaScriptModule } from 'custom-elements-manifest';
import { Logger } from 'typescript-template-language-service-decorator';
import { CEM_FIRST_LOADED_EVENT, DESIGN_SYSTEM_PREFIX_TOKEN } from '../constants/misc';
import { getStore } from '../utils/kvstore';
import {
  CEMTConfig,
  CustomElementDef,
  CustomElementsResource,
  ManifestRepository,
} from './custom-elements.types';

export class CustomElementsAnalyzerManifestParser
  extends EventEmitter
  implements CustomElementsResource
{
  constructor(
    private logger: Logger,
    private manifestRepository: ManifestRepository,
    private config: CEMTConfig
  ) {
    super();
    logger.log(
      `Setting up CustomElementsAnalyzerManifestParser class with config ${JSON.stringify(config)}`
    );
    this.manifestRepository.registerCallbackForPostUpdate(() => {
      this.logger.log(`callbackAfterUpdate`);
      this.transformManifest();
      getStore(this.logger).clearCache();
      this.emit(CEM_FIRST_LOADED_EVENT);
    });
    this.manifestRepository.requestUpdate();
  }

  /**
   * API
   */
  data: Map<string, CustomElementDef> = new Map();

  getConfig() {
    return this.config;
  }

  /**
   * PRIVATE
   */

  private transformManifest() {
    this.logger.log(`tranfsormManifest: ${JSON.stringify(this.manifestRepository.manifest)}`);

    // TODO: Only supports FAST @customElements export in same file
    // TODO: Support mixin custom elements
    for (const module of this.manifestRepository.manifest.modules) {
      if (this.parseRegisterExportedCustomElement(module)) continue;
      this.parseRegisterComposedCustomElement(module);
    }

    this.logger.log(`webComponentNames: ${JSON.stringify([...this.data.keys()])}`);
  }

  /**
   * Parses an export which is a class that is composed and later registered with a
   * design system. Expects the tagName to have `%%prefix%%-` which is a placeholder
   * for the design system prefix.
   */
  private parseRegisterComposedCustomElement(module: JavaScriptModule): boolean {
    const declaration = module.declarations?.filter(
      (d) => d.kind === 'class' && 'customElement' in d && d.customElement && 'tagName' in d
    )[0] as CustomElement | undefined;

    if (declaration === undefined) return false;

    this.logger.log(`composed declaration: ${JSON.stringify(declaration)}`);

    // We know it has a tagName as we checked in the filter
    const baseTag = (declaration as { tagName: string }).tagName;

    const tagName = this.config.designSystemPrefix
      ? baseTag.replace(DESIGN_SYSTEM_PREFIX_TOKEN, this.config.designSystemPrefix)
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
  private parseRegisterExportedCustomElement(module: JavaScriptModule): boolean {
    const name = module.exports?.filter((m) => m.kind === 'custom-element-definition')[0]?.name;

    if (!name) return false;

    this.logger.log(`name: ${JSON.stringify(name)}`);

    const declaration = module.declarations?.filter(
      (d) => d.kind === 'class' && 'customElement' in d && d.customElement
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
