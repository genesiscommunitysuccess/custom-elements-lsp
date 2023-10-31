import type { Package } from 'custom-elements-manifest';

export const baseCase: Package = {
  schemaVersion: '1.0.0',
  readme: '',
  modules: [
    {
      declarations: [
        {
          description: '',
          kind: 'class',
          members: [
            {
              default: "'qix'",
              kind: 'field',
              name: 'baz',
              type: {
                text: 'string',
              },
            },
          ],
          name: 'MyElement',
          superclass: {
            name: 'ParentElement',
            package: 'my-library',
          },
        },
        {
          description: '',
          kind: 'class',
          members: [
            {
              default: "'qix'",
              inheritedFrom: {
                module: '/test/fixtures/default/sourcecode/default.js',
                name: '<local>_MyElement',
              },
              kind: 'field',
              name: 'baz',
              type: {
                text: 'string',
              },
            },
          ],
          name: 'GrandchildElement',
          superclass: {
            module: '/test/fixtures/default/sourcecode/default.js',
            name: 'MyElement',
          },
        },
        {
          customElement: true,
          description: '',
          kind: 'class',
          members: [
            {
              default: "'b'",
              kind: 'field',
              name: 'a',
              type: {
                text: 'string',
              },
            },
          ],
          name: 'AnotherElement',
          superclass: {
            name: 'HTMLElement',
          },
        },
      ],
      exports: [
        {
          declaration: {
            module: '/test/fixtures/default/sourcecode/default.js',
            name: 'MyElement',
          },
          kind: 'js',
          name: 'MyElement',
        },
        {
          declaration: {
            module: '/test/fixtures/default/sourcecode/default.js',
            name: 'GrandchildElement',
          },
          kind: 'js',
          name: 'GrandchildElement',
        },
        {
          declaration: {
            module: '/test/fixtures/default/sourcecode/default.js',
            name: 'AnotherElement',
          },
          kind: 'js',
          name: 'AnotherElement',
        },
      ],
      kind: 'javascript-module',
      path: '/test/fixtures/default/sourcecode/default.js',
    },
    {
      declarations: [
        {
          description: '',
          kind: 'class',
          members: [
            {
              default: "'qix'",
              inheritedFrom: {
                module: '/test/fixtures/default/sourcecode/default.js',
                name: '<local>_MyElement',
              },
              kind: 'field',
              name: 'baz',
              type: {
                text: 'string',
              },
            },
          ],
          name: 'AnotherClass',
          superclass: {
            module: '//test/fixtures/default/sourcecode/default',
            name: 'MyElement',
          },
        },
      ],
      exports: [
        {
          declaration: {
            module: '/test/fixtures/default/sourcecode/another.js',
            name: 'AnotherClass',
          },
          kind: 'js',
          name: 'AnotherClass',
        },
      ],
      kind: 'javascript-module',
      path: '/test/fixtures/default/sourcecode/another.js',
    },
  ],
};
