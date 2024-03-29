import { ClassField } from 'custom-elements-manifest';
import { Logger } from 'typescript-template-language-service-decorator';
import { DESIGN_SYSTEM_PREFIX_TOKEN } from '../constants/misc';
import { getStore } from '../utils/kvstore';
import {
  CEInfo,
  CustomElementAttribute,
  CustomElementEvent,
  CustomElementMember,
  CustomElementsResource,
  CustomElementsService,
  GetCEInfo,
} from './custom-elements.types';

const PARSE_PATH_REGEXP = /node_modules\/(?:(?:(@[^\/]+\/[^\/]+))|(?:([^\/]+)\/))/;

export class CustomElementsServiceImpl implements CustomElementsService {
  constructor(
    private logger: Logger,
    private ceData: CustomElementsResource,
  ) {
    this.logger.log('Setting up CustomElementsServiceImpl');
  }

  /**
   * Gets the tag name with the design system prefix replaced with a placeholder if appropriate, or gets the tag name as-is.
   * If the custom element is unknown, returns null.
   */
  getCEDefinitionName(name: string): string | null {
    if (!this.customElementKnown(name)) return null;
    const maybeDSPrefix = this.ceData.getConfig().designSystemPrefix;
    return name.replace(maybeDSPrefix ?? '', DESIGN_SYSTEM_PREFIX_TOKEN);
  }

  getAllEvents(): CustomElementEvent[] {
    // TODO: Will need to invalidate cache if using --watch in future
    return getStore(this.logger).TSUnsafeGetOrAdd('ce-get-all-events', () =>
      this.getCENames().reduce(
        (acum: CustomElementEvent[], ceName: string) => acum.concat(this.getCEEvents(ceName)),
        [],
      ),
    );
  }

  getCEMembers(name: string): CustomElementMember[] {
    const definition = this.ceData.data.get(name);
    if (!definition || !definition.members) return [];

    const classFields = definition.members.filter((m) => m.kind === 'field') as ClassField[];

    return classFields.map((f) => ({
      name: f.name,
      type: f.type?.text ?? 'any',
      referenceClass: f.inheritedFrom?.name ?? definition.name,
      deprecated: f.deprecated !== undefined,
      isStatic: f.static,
      privacy: f.privacy,
    }));
  }

  getCEAttributes(name: string): CustomElementAttribute[] {
    const definition = this.ceData.data.get(name);
    if (!definition || !definition.attributes) return [];

    return definition.attributes.map((a) => ({
      name: a.name ?? a.fieldName,
      type: a.type?.text ?? 'any',
      referenceClass: a.inheritedFrom?.name ?? definition.name,
      deprecated: a.deprecated === 'true',
      description: a.description,
    }));
  }

  getCEEvents(name: string): CustomElementEvent[] {
    const definition = this.ceData.data.get(name);
    if (!definition || !definition.events) return [];

    return definition.events.map((a) => ({
      name: a.name,
      type: a.type?.text ?? a.description ?? 'any',
      referenceClass: a.inheritedFrom?.name ?? definition.name,
      deprecated: a.deprecated === 'true',
      description: a.description,
    }));
  }

  getCENames(): string[] {
    return [...this.ceData.data.keys()];
  }

  getAllCEInfo(config: GetCEInfo): CEInfo[] {
    const info: CEInfo[] = [];
    for (const [k, v] of this.ceData.data) {
      info.push({
        tagName: k,
        path: this.processPath(v.path, config.getFullPath),
        className: v.name,
        superclassName: v.superclass?.name,
        description: v.description,
      });
    }
    return info;
  }

  getCEPath(name: string, config: Pick<GetCEInfo, 'getFullPath'>): string | null {
    const key = config.getFullPath ? 'ce-get-all-paths-full' : 'ce-get-all-paths-short';
    const mapWithFullPaths = getStore(this.logger).TSUnsafeGetOrAdd(
      key,
      () => new Map(this.getAllCEInfo(config).map(({ tagName, path }) => [tagName, path])),
    );
    return mapWithFullPaths.get(name) ?? null;
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
    const matches = path.match(PARSE_PATH_REGEXP);
    if (matches === null) {
      return path;
    }
    return matches.slice(1).filter((m) => m)[0];
  }
}
