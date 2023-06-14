import {
  getCEServiceFromStubbedResource,
  getCEServiceFromTestJsonResource,
} from '../../jest/custom-elements';
import { expectArrayElements } from '../../jest/utils';
import { CustomElementDef } from './custom-elements.types';

describe('customElementKnown', () => {
  it('Returns true if the element is known', () => {
    const ceResource = getCEServiceFromStubbedResource();
    const res = ceResource.customElementKnown('no-attr');
    expect(res).toBe(true);
  });
  it('Returns false if the element is not found', () => {
    const ceResource = getCEServiceFromStubbedResource();
    const res = ceResource.customElementKnown('not-found');
    expect(res).toBe(false);
  });
});

describe('getCENames', () => {
  it('Returns the names of the custom elements from the manifest', () => {
    const ceResource = getCEServiceFromTestJsonResource({
      designSystemPrefix: undefined,
    });
    const res = ceResource.getCENames();
    expectArrayElements(res, [
      'root-component',
      'example-counter',
      'person-avatar',
      '%%prefix%%-button',
      'theme-picker',
    ]);
  });

  it('Returns the names of the custom elements from the manifest, with the prefix replaced if the design system prefix is set', () => {
    const ceResource = getCEServiceFromTestJsonResource({});
    const res = ceResource.getCENames();
    expectArrayElements(res, [
      'root-component',
      'example-counter',
      'person-avatar',
      'example-button',
      'theme-picker',
    ]);
  });
});

describe('getCEAttributes', () => {
  const tests: [string, [string], any][] = [
    ['Unknown element returns an empty array', ['invalid-ce'], []],
    [
      'Element returns its attribute',
      ['example-button'],
      [
        {
          name: 'title',
          referenceClass: 'CustomButton',
          type: 'string',
          deprecated: false,
        },
      ],
    ],
    [
      'Element returns its attributes with correct type and name, accounting for if the attribute does not match the variable name. Deprecated attributes are marked as such.',
      ['person-avatar'],
      [
        {
          name: 'avatar-src',
          referenceClass: 'Avatar',
          type: 'string',
          deprecated: false,
        },
        {
          name: 'fullInfoDisabled',
          referenceClass: 'Avatar',
          type: 'boolean',
          deprecated: false,
        },
        {
          deprecated: true,
          name: 'unused',
          referenceClass: 'Avatar',
          type: 'string',
        },
      ],
    ],
    [
      'Element returns its attributes with reference class as a superclass if appropriate',
      ['example-counter'],
      [
        {
          name: 'reverse',
          referenceClass: 'ExampleCounter',
          type: 'boolean',
          deprecated: false,
        },
        {
          name: 'display-text',
          referenceClass: 'Counter',
          type: 'string | undefined',
          deprecated: false,
        },
      ],
    ],
  ];

  for (const [name, [tagName], expected] of tests) {
    const ceResource = getCEServiceFromTestJsonResource({});
    it(name, () => {
      const res = ceResource.getCEAttributes(tagName);
      expect(res).toEqual(expected);
    });
  }
});

describe('processPath', () => {
  const tests: [string, [string, boolean], string][] = [
    ['Returns the input if getFullPath is true', ['Input string', true], 'Input string'],
    [
      'Returns the input including node_modules/@scope if getFullPath is true',
      ['node_modules/@scope/pkg/index.ts', true],
      'node_modules/@scope/pkg/index.ts',
    ],
    [
      'Returns the entire path if a local file, if getFullpath is false',
      ['pkg/index.ts', false],
      'pkg/index.ts',
    ],
    [
      'Returns the package if a library file, if getFullpath is false, and the package is not scoped',
      ['node_modules/pkg/index.ts', false],
      'pkg',
    ],
    [
      'Returns the scoped package if a library file, if getFullpath is false, and the package is scoped',
      ['node_modules/@scope/pkg/index.ts', false],
      '@scope/pkg',
    ],
  ];

  for (const [name, [path, getFullpath], expected] of tests) {
    const ceResource = getCEServiceFromTestJsonResource({});
    it(name, () => {
      const res = (ceResource as any).processPath(path, getFullpath);
      expect(res).toEqual(expected);
    });
  }
});

describe('getAllCEInfo', () => {
  it('Returns the custom element info with full paths when configured', () => {
    const ceResource = getCEServiceFromStubbedResource();
    const res = ceResource.getAllCEInfo({ getFullPath: true });
    expectArrayElements(res, [
      {
        path: 'src/components/avatar/avatar.ts',
        tagName: 'custom-element',
      },
      {
        path: 'node_modules/pkg/src/components/misc/no-attr.ts',
        tagName: 'no-attr',
      },
    ]);
  });

  it('Returns the custom element info with reduced paths when configured', () => {
    const ceResource = getCEServiceFromStubbedResource();
    const res = ceResource.getAllCEInfo({ getFullPath: false });
    expectArrayElements(res, [
      {
        path: 'src/components/avatar/avatar.ts',
        tagName: 'custom-element',
      },
      {
        path: 'pkg',
        tagName: 'no-attr',
      },
    ]);
  });
});

describe('getCEEvents', () => {
  it('Returns nothing for a unknown element', () => {
    const ceResource = getCEServiceFromStubbedResource();
    const res = ceResource.getCEEvents('not-found');
    expect(res).toEqual([]);
  });

  it('Returns nothing for a element with no events', () => {
    const ceResource = getCEServiceFromStubbedResource();
    const res = ceResource.getCEEvents('no-attr');
    expect(res).toEqual([]);
  });

  it('Returns its events, with the reference class being itself if it is not inherited', () => {
    const ceResource = getCEServiceFromStubbedResource();
    const res = ceResource.getCEEvents('custom-element');
    expect(res).toEqual([
      {
        name: 'event',
        referenceClass: 'CustomElement',
        type: 'MouseEvent',
      },
      {
        name: 'inherited',
        referenceClass: 'ParentElement',
        type: 'MouseEvent',
      },
    ]);
  });
});

describe('getCEMembers', () => {
  it('Returns nothing for a unknown element', () => {
    const ceResource = getCEServiceFromStubbedResource();
    const res = ceResource.getCEMembers('not-found');
    expect(res).toEqual([]);
  });

  it('Returns nothing for a element with no members', () => {
    const ceResource = getCEServiceFromStubbedResource();
    const res = ceResource.getCEMembers('no-attr');
    expect(res).toEqual([]);
  });

  it('Returns its field members (skipping methods) with correct reference class and other modifiers', () => {
    const ceResource = getCEServiceFromStubbedResource();
    const res = ceResource.getCEMembers('custom-element');
    expect(res).toEqual([
      {
        deprecated: true,
        isStatic: true,
        name: 'member',
        privacy: 'public',
        referenceClass: 'ParentElement',
        type: 'string',
      },
    ]);
  });
});

describe('getAllEvents', () => {
  it('Returns all events for all elements', () => {
    const resource = new Map<string, CustomElementDef>();
    resource.set('another-element', {
      name: 'AnotherElement',
      kind: 'class',
      path: 'src/components/another/another.ts',
      customElement: true,
      events: [
        {
          name: 'silenced',
          type: { text: 'MouseEvent' },
        },
        {
          name: 'inherited',
          type: { text: 'string' },
          inheritedFrom: {
            name: 'AnotherParent',
          },
        },
      ],
    });

    const ceResource = getCEServiceFromStubbedResource(resource);

    const res = ceResource.getAllEvents();

    expect(res).toEqual([
      {
        name: 'event',
        referenceClass: 'CustomElement',
        type: 'MouseEvent',
      },
      {
        name: 'inherited',
        referenceClass: 'ParentElement',
        type: 'MouseEvent',
      },
      {
        name: 'silenced',
        referenceClass: 'AnotherElement',
        type: 'MouseEvent',
      },
      {
        name: 'inherited',
        referenceClass: 'AnotherParent',
        type: 'string',
      },
    ]);

    expect(ceResource.getAllEvents()).toBe(res);
  });
});

describe('getCEPath', () => {
  it('Returns null for an unknown custom element', () => {
    const ceResource = getCEServiceFromStubbedResource();
    const res = ceResource.getCEPath('unknown-element', { getFullPath: true });
    expect(res).toBeNull();
  });

  it('Returns full paths for known custom elements when configured', () => {
    const ceResource = getCEServiceFromStubbedResource();
    const res = ceResource.getCEPath('custom-element', { getFullPath: true });
    expect(res).toBe('src/components/avatar/avatar.ts');

    const resTwo = ceResource.getCEPath('no-attr', { getFullPath: true });
    expect(resTwo).toBe('node_modules/pkg/src/components/misc/no-attr.ts');
  });

  it('Returns short paths for known custom elements when configured', () => {
    const ceResource = getCEServiceFromStubbedResource();
    const res = ceResource.getCEPath('custom-element', { getFullPath: false });
    expect(res).toBe('src/components/avatar/avatar.ts');

    const resTwo = ceResource.getCEPath('no-attr', { getFullPath: false });
    expect(resTwo).toBe('pkg');
  });
});
