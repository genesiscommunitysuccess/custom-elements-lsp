import type { ClassDeclaration, Module, Package } from 'custom-elements-manifest';

import { AppliedTransform, applySuperclassTransformMangleClass, reverseTransform } from '../src/';

describe('applySuperclassOverrideMangleClass', () => {
  const classDef: ClassDeclaration = {
    kind: 'class',
    name: 'MyElement',
    superclass: {
      package: 'my-library',
      name: 'ParentElement',
    },
  };

  const moduleDoc: Module = {
    kind: 'javascript-module',
    path: 'module.js',
    exports: [
      {
        kind: 'js',
        name: 'MyElement',
        declaration: {
          name: 'MyElement',
        },
      },
    ],
  };

  describe('when there is no superclass definition on the class definition', () => {
    it('throws an error', () => {
      const classDefNoSuperclass: ClassDeclaration = (() => {
        const c = structuredClone(classDef);
        c.superclass = undefined;
        return c;
      })();
      let err: Error;
      try {
        applySuperclassTransformMangleClass(classDefNoSuperclass, structuredClone(moduleDoc), {});
      } catch (e) {
        err = e;
      }
      expect(err!.message).toEqual('Class definition does not contain a superclass definition.');
    });
  });

  describe('when there is no config definition for the superclass package', () => {
    it('throws an error', () => {
      let err: Error;
      try {
        applySuperclassTransformMangleClass(
          structuredClone(classDef),
          structuredClone(moduleDoc),
          {},
        );
      } catch (e) {
        err = e;
      }
      expect(err!.message).toEqual('Plugin config does not contain config for superclass package');
    });
  });

  describe('when there is no transform function or override config for the superclass', () => {
    it('does not change any of the input variables, returns undefined', () => {
      const classDefCopy: ClassDeclaration = structuredClone(classDef);
      const moduleDocCopy: Module = structuredClone(moduleDoc);
      const res = applySuperclassTransformMangleClass(classDefCopy, moduleDocCopy, {
        ['my-library']: {},
      });
      expect(classDefCopy).toEqual(classDef);
      expect(moduleDocCopy).toEqual(moduleDoc);
      expect(res).toBeNull();
    });
  });

  describe('when there is a override setting for the superclass', () => {
    it('it changes the superclass name as specified by the token, and mangles the class name in the definition and export. Returns the transformer object.', () => {
      const classDefCopy: ClassDeclaration = structuredClone(classDef);
      const moduleDocCopy: Module = structuredClone(moduleDoc);
      const res = applySuperclassTransformMangleClass(classDefCopy, moduleDocCopy, {
        ['my-library']: { override: { ParentElement: 'MyElement' } },
      });
      expect(classDefCopy).toEqual({
        ...classDef,
        name: 's_MyElement',
        superclass: { ...classDef.superclass, name: 'MyElement' },
      });
      expect(moduleDocCopy).toEqual({
        ...moduleDoc,
        exports: [
          {
            kind: 'js',
            name: 's_MyElement',
            declaration: {
              name: 's_MyElement',
            },
          },
        ],
      });
      expect(res).toEqual({
        class: 'MyElement',
        package: 'my-library',
        superclass: 'ParentElement',
        path: 'module.js',
      });
    });
  });

  describe('when there is a transformer setting for the superclass', () => {
    it('it changes the superclass name as specified by the transformer, and mangles the class name in the definition and export. Returns the transformer', () => {
      const classDefCopy: ClassDeclaration = structuredClone(classDef);
      const moduleDocCopy: Module = structuredClone(moduleDoc);
      const res = applySuperclassTransformMangleClass(classDefCopy, moduleDocCopy, {
        ['my-library']: { '*': (token: string) => token.replace('Parent', 'Super') },
      });
      expect(classDefCopy).toEqual({
        ...classDef,
        name: 's_MyElement',
        superclass: { ...classDef.superclass, name: 'SuperElement' },
      });
      expect(moduleDocCopy).toEqual({
        ...moduleDoc,
        exports: [
          {
            kind: 'js',
            name: 's_MyElement',
            declaration: {
              name: 's_MyElement',
            },
          },
        ],
      });
      expect(res).toEqual({
        class: 'MyElement',
        package: 'my-library',
        path: 'module.js',
        superclass: 'ParentElement',
      });
    });
  });

  describe('when there is a override setting and a transformer for the superclass', () => {
    it('it changes the superclass name as specified by the token, and mangles the class name in the definition and export. Returns the transformer.', () => {
      const classDefCopy: ClassDeclaration = structuredClone(classDef);
      const moduleDocCopy: Module = structuredClone(moduleDoc);
      const res = applySuperclassTransformMangleClass(classDefCopy, moduleDocCopy, {
        ['my-library']: {
          '*': (token: string) => token.replace('Parent', 'Super'),
          override: { ParentElement: 'MyElement' },
        },
      });
      expect(classDefCopy).toEqual({
        ...classDef,
        name: 's_MyElement',
        superclass: { ...classDef.superclass, name: 'MyElement' },
      });
      expect(moduleDocCopy).toEqual({
        ...moduleDoc,
        exports: [
          {
            kind: 'js',
            name: 's_MyElement',
            declaration: {
              name: 's_MyElement',
            },
          },
        ],
      });
      expect(res).toEqual({
        class: 'MyElement',
        package: 'my-library',
        path: 'module.js',
        superclass: 'ParentElement',
      });
    });
  });

  describe('when there is a transformer for the superclass, but it does not alter the name', () => {
    it('does not change any of the input variables, returns undefined', () => {
      const classDefCopy: ClassDeclaration = structuredClone(classDef);
      const moduleDocCopy: Module = structuredClone(moduleDoc);
      const res = applySuperclassTransformMangleClass(classDefCopy, moduleDocCopy, {
        ['my-library']: {
          '*': (token: string) => token.replace('NoMatch', 'Super'),
        },
      });
      expect(classDefCopy).toEqual(classDef);
      expect(moduleDocCopy).toEqual(moduleDoc);
      expect(res).toBeNull();
    });
  });
});

describe('reverseTransform', () => {
  const transform: AppliedTransform = {
    class: 'MyElement',
    superclass: 'ParentElement',
    path: 'module.js',
    package: 'my-library',
  };
  const manifest: Package = {
    modules: [
      {
        path: 'module.js',
        kind: 'javascript-module',
        exports: [
          {
            kind: 'js',
            name: 's_MyElement',
            declaration: {
              name: 's_MyElement',
              module: 'module.js',
            },
          },
        ],
        declarations: [
          {
            kind: 'class',
            name: 's_MyElement',
            superclass: {
              name: 'MyElement',
              package: 'my-library',
            },
          },
        ],
      },
    ],
    schemaVersion: '1.0.0',
  };

  describe('when there are no modules in the manifest matching the transform', () => {
    it('throws an error', () => {
      const emptyManifest: Package = {
        modules: [],
        schemaVersion: '1.0.0',
      };
      let err: Error;
      try {
        reverseTransform(structuredClone(transform), emptyManifest);
      } catch (e) {
        err = e;
      }
      expect(err!.message).toEqual(
        'Could not find the transformed class definition, export, or module.',
      );
    });
  });

  describe('when there is no matching declaration in the module', () => {
    it('throws an error', () => {
      const noMatchingDeclarationManifest: Package = structuredClone(manifest);
      noMatchingDeclarationManifest.modules[0].declarations![0].name = 'curry';
      let err: Error;
      try {
        reverseTransform(structuredClone(transform), noMatchingDeclarationManifest);
      } catch (e) {
        err = e;
      }
      expect(err!.message).toEqual(
        'Could not find the transformed class definition, export, or module.',
      );
    });
  });

  describe('when there is no matching export in the module', () => {
    it('throws an error', () => {
      const noMatchingExportManifest: Package = structuredClone(manifest);
      noMatchingExportManifest.modules[0].exports![0].declaration.module = 'curry';
      let err: Error;
      try {
        reverseTransform(structuredClone(transform), noMatchingExportManifest);
      } catch (e) {
        err = e;
      }
      expect(err!.message).toEqual(
        'Could not find the transformed class definition, export, or module.',
      );
    });
  });

  describe('when the relevant export and declaration objects match the translation', () => {
    it('throws an error', () => {
      const clonedManifest = structuredClone(manifest);
      reverseTransform(structuredClone(transform), clonedManifest);
      expect(clonedManifest).toEqual({
        modules: [
          {
            declarations: [
              {
                kind: 'class',
                name: 'MyElement',
                superclass: {
                  name: 'ParentElement',
                  package: 'my-library',
                },
              },
            ],
            exports: [
              {
                declaration: {
                  module: 'module.js',
                  name: 'MyElement',
                },
                kind: 'js',
                name: 'MyElement',
              },
            ],
            kind: 'javascript-module',
            path: 'module.js',
          },
        ],
        schemaVersion: '1.0.0',
      });
    });
  });
});
