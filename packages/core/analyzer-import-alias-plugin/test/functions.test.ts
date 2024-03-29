import type { ClassDeclaration, Module, Package } from 'custom-elements-manifest';

import {
  AppliedTransform,
  getNewSuperclassName,
  ImportAliasPluginOptions,
  namespaceClassnameApplySuperclass,
  NAMESPACE_PREFIX,
  reverseTransform,
} from '../src/';

describe('namespaceClassnameApplySuperclass', () => {
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

  describe('when there is no matching export to the classdef', () => {
    it('returns null', () => {
      const classDefWithNoMatchingExport = structuredClone(classDef);
      classDefWithNoMatchingExport.name = 'banana';
      const res = namespaceClassnameApplySuperclass(
        classDefWithNoMatchingExport,
        structuredClone(moduleDoc),
        null,
      );
      expect(res).toBeNull();
    });
  });

  describe('when there is no new superclass name', () => {
    it('namespaces the classname and export, returns transform', () => {
      const _classDef = structuredClone(classDef);
      delete _classDef.superclass;
      const _moduleDoc = structuredClone(moduleDoc);
      const res = namespaceClassnameApplySuperclass(_classDef, _moduleDoc, null);
      expect(_classDef).toEqual({
        ...classDef,
        name: `${NAMESPACE_PREFIX}${classDef.name}`,
        superclass: undefined,
      });
      expect(_moduleDoc).toEqual({
        ...moduleDoc,
        exports: [
          {
            kind: 'js',
            name: `${NAMESPACE_PREFIX}MyElement`,
            declaration: {
              name: `${NAMESPACE_PREFIX}MyElement`,
            },
          },
        ],
      });
      expect(res).toEqual({
        class: 'MyElement',
        package: undefined,
        path: 'module.js',
        superclass: undefined,
      });
    });
  });

  describe('when there is a superclass name specified', () => {
    it('namespaces the classname and export, applies the new superclass name, returns transform (including package and superclass name)', () => {
      const _classDef = structuredClone(classDef);
      const _moduleDoc = structuredClone(moduleDoc);
      const res = namespaceClassnameApplySuperclass(_classDef, _moduleDoc, 'BaseClass');
      expect(_classDef).toEqual({
        ...classDef,
        name: `${NAMESPACE_PREFIX}${classDef.name}`,
        superclass: {
          ...classDef.superclass,
          name: 'BaseClass',
        },
      });
      expect(_moduleDoc).toEqual({
        ...moduleDoc,
        exports: [
          {
            kind: 'js',
            name: `${NAMESPACE_PREFIX}MyElement`,
            declaration: {
              name: `${NAMESPACE_PREFIX}MyElement`,
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
});

describe('getNewSuperclassName', () => {
  const classDef: ClassDeclaration = {
    kind: 'class',
    name: 'MyElement',
  };

  describe('when there is no superclass, package, or module specified', () => {
    it('returns null', () => {
      const config = {};
      expect(getNewSuperclassName(classDef, config)).toBeNull();
      expect(
        getNewSuperclassName({ ...classDef, superclass: { name: 'test' } }, config),
      ).toBeNull();
    });
  });

  describe('when the superclass module is specified', () => {
    it('returns the superclass name with the namespace prefix', () => {
      const config = {};
      const res = getNewSuperclassName(
        { ...classDef, superclass: { module: 'superclass.js', name: 'SuperClass' } },
        config,
      );
      expect(res).toEqual(`${NAMESPACE_PREFIX}SuperClass`);
    });
  });

  describe('when the superclass package is specified, but that is not specified in the config', () => {
    it('returns null', () => {
      const config = {};
      const res = getNewSuperclassName(
        { ...classDef, superclass: { package: 'my-library', name: 'SuperClass' } },
        config,
      );
      expect(res).toBeNull();
    });
  });

  describe('when the superclass package is specified, and there is a transformer function specified', () => {
    it('returns the transformed parent class', () => {
      const config: ImportAliasPluginOptions = {
        'my-library': { '*': (name) => name.replace('Super', 'Parent') },
      };
      const res = getNewSuperclassName(
        { ...classDef, superclass: { package: 'my-library', name: 'SuperClass' } },
        config,
      );
      expect(res).toEqual(`ParentClass`);
    });
  });

  describe('when the superclass package is specified, but the transformed result is the same as the original name', () => {
    it('returns null', () => {
      const config: ImportAliasPluginOptions = {
        'my-library': { '*': (name) => name.replace('Super', 'Super') },
      };
      const res = getNewSuperclassName(
        { ...classDef, superclass: { package: 'my-library', name: 'SuperClass' } },
        config,
      );
      expect(res).toBeNull();
    });
  });

  describe('when the superclass package is specified, and there is a replacement override', () => {
    it('returns the override name if there is a match', () => {
      const config: ImportAliasPluginOptions = {
        'my-library': { SuperClass: 'ParentClass' },
      };
      const res = getNewSuperclassName(
        { ...classDef, superclass: { package: 'my-library', name: 'SuperClass' } },
        config,
      );
      expect(res).toEqual(`ParentClass`);
    });
  });

  describe('when the superclass package is specified, and there is a replacement override, and a transformer function', () => {
    it('falls back on the transformer function if there is no matching override', () => {
      const config: ImportAliasPluginOptions = {
        'my-library': {
          '*': (name) => name.replace('Super', 'Base'),
          banana: 'apple',
        },
      };
      const res = getNewSuperclassName(
        { ...classDef, superclass: { package: 'my-library', name: 'SuperClass' } },
        config,
      );
      expect(res).toEqual(`BaseClass`);
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
            name: `${NAMESPACE_PREFIX}MyElement`,
            declaration: {
              name: `${NAMESPACE_PREFIX}MyElement`,
              module: 'module.js',
            },
          },
        ],
        declarations: [
          {
            kind: 'class',
            name: `${NAMESPACE_PREFIX}MyElement`,
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
