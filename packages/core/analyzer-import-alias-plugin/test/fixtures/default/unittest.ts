import type { Package } from 'custom-elements-manifest';

export const baseCase: Package = {
  schemaVersion: '1.0.0',
  readme: '',
  modules: [
    {
      kind: 'javascript-module',
      path: '/test/fixtures/default/sourcecode/default.js',
      declarations: [
        {
          kind: 'class',
          description: '',
          name: 'MyElement',
          members: [{ kind: 'field', name: 'baz', type: { text: 'string' }, default: "'qix'" }],
          superclass: {
            name: 'ParentElement',
            module: '//test/fixtures/default/sourcecode/superclass',
          },
        },
      ],
      exports: [
        {
          kind: 'js',
          name: 'MyElement',
          declaration: {
            name: 'MyElement',
            module: '/test/fixtures/default/sourcecode/default.js',
          },
        },
      ],
    },
    {
      kind: 'javascript-module',
      path: '/test/fixtures/default/sourcecode/superclass.js',
      declarations: [
        {
          kind: 'class',
          description: '',
          name: 'MyElement',
          members: [{ kind: 'field', name: 'foo', type: { text: 'string' }, default: "'bar'" }],
        },
      ],
      exports: [
        {
          kind: 'js',
          name: 'MyElement',
          declaration: {
            name: 'MyElement',
            module: '/test/fixtures/default/sourcecode/superclass.js',
          },
        },
      ],
    },
  ],
};
