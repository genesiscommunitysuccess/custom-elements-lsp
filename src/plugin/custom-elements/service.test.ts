import {
  getCEServiceFromStubbedResource,
  getCEServiceFromTestJsonResource,
} from '../../jest/custom-elements';
import { expectArrayElements } from '../../jest/utils';

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

describe('getCEInfo', () => {
  it('Returns the custom element info with full paths when configured', () => {
    const ceResource = getCEServiceFromStubbedResource();
    const res = ceResource.getCEInfo({ getFullPath: true });
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
    const res = ceResource.getCEInfo({ getFullPath: false });
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
