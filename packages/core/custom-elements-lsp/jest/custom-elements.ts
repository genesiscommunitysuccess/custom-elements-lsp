import { readFileSync, existsSync } from 'fs';
import { Package } from 'custom-elements-manifest';
import { CEMTConfig, CustomElementDef } from '../src/custom-elements/custom-elements.types';
import { CustomElementsAnalyzerManifestParser } from '../src/custom-elements/repository';
import { CustomElementsServiceImpl } from '../src/custom-elements/service';
import { getLogger } from './utils';

const MANIFSST_PATH = './jest/ce-test.json';

let manifest: string;

/**
 * Builds a stubbed `CustomElementsResource` and constructs a `CustomElementsServiceImpl`.
 */
export const getCEServiceFromStubbedResource = (
  override: Map<string, CustomElementDef> = new Map(),
) => {
  const resource = {
    data: new Map<string, CustomElementDef>(),
    getConfig: () => ({ designSystemPrefix: 'example' }),
  };

  resource.data.set('custom-element', {
    name: 'CustomElement',
    kind: 'class',
    path: 'src/components/avatar/avatar.ts',
    customElement: true,
    attributes: [
      { name: 'colour', type: { text: 'string' } },
      { name: 'activated', type: { text: 'boolean' }, deprecated: 'true' },
    ],
    events: [
      {
        name: 'event',
        type: { text: 'MouseEvent' },
      },
      {
        name: 'inherited',
        type: { text: 'MouseEvent' },
        inheritedFrom: {
          name: 'ParentElement',
        },
      },
    ],
    members: [
      { kind: 'method', name: 'method' },
      {
        kind: 'field',
        name: 'member',
        inheritedFrom: {
          name: 'ParentElement',
        },
        type: { text: 'string' },
        static: true,
        privacy: 'public',
        deprecated: 'reason',
      },
    ],
  });

  resource.data.set('no-attr', {
    name: 'NoAttribute',
    kind: 'class',
    path: 'node_modules/pkg/src/components/misc/no-attr.ts',
    customElement: true,
    attributes: [],
  });

  resource.data = new Map([...resource.data, ...override]);

  return new CustomElementsServiceImpl(getLogger(), resource);
};

/**
 * Builds a real `CustomElementsAnalyzerManifestParser` from the test manifest
 * located at `MANIFSST_PATH`, and constructs a `CustomElementsServiceImpl` using
 * it as the resource.
 */
export function getCEServiceFromTestJsonResource(configOverride: Partial<CEMTConfig>) {
  if (!manifest) {
    if (!existsSync(MANIFSST_PATH)) {
      console.error(`ERROR: tests require manifest from /example application to exists.`);
      console.error(
        `ERROR: to generate manifest go into the 'example' directory and run 'npm run lsp:analyze'`,
      );
      process.exit(1);
    }
    manifest = readFileSync(MANIFSST_PATH, 'utf8');
    manifest = JSON.parse(manifest);
  }

  const logger = getLogger();

  const ceRepo = new CustomElementsAnalyzerManifestParser(
    logger,
    {
      manifest: manifest as unknown as Package,
      requestUpdate: async () => {},
      registerCallbackForPostUpdate: (_: () => void) => {},
    },
    {
      designSystemPrefix: 'example',
      ...configOverride,
    },
  );

  // Bypass requirements for async events by manually calling the transformation function
  (ceRepo as any).transformManifest();

  return new CustomElementsServiceImpl(logger, ceRepo);
}
