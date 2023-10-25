import type { ClassDeclaration, Reference, Module } from 'custom-elements-manifest';
import * as ts from 'typescript';

import { applySuperclassTransformMangleClass } from '../src/';

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
  path: 'module',
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

describe('applySuperclassOverrideMangleClass', () => {
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
    it('does not change any of the input variables', () => {
      const classDefCopy: ClassDeclaration = structuredClone(classDef);
      const moduleDocCopy: Module = structuredClone(moduleDoc);
      applySuperclassTransformMangleClass(classDefCopy, moduleDocCopy, { ['my-library']: {} });
      expect(classDefCopy).toEqual(classDef);
      expect(moduleDocCopy).toEqual(moduleDoc);
    });
  });

  describe('when there is a override setting for the superclass', () => {
    it('it changes the superclass name as specified by the token, and mangles the class name in the definition and export', () => {
      const classDefCopy: ClassDeclaration = structuredClone(classDef);
      const moduleDocCopy: Module = structuredClone(moduleDoc);
      applySuperclassTransformMangleClass(classDefCopy, moduleDocCopy, {
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
    });
  });

  describe('when there is a transformer setting for the superclass', () => {
    it('it changes the superclass name as specified by the transformer, and mangles the class name in the definition and export', () => {
      const classDefCopy: ClassDeclaration = structuredClone(classDef);
      const moduleDocCopy: Module = structuredClone(moduleDoc);
      applySuperclassTransformMangleClass(classDefCopy, moduleDocCopy, {
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
    });
  });

  describe('when there is a override setting and a transformer for the superclass', () => {
    it('it changes the superclass name as specified by the token, and mangles the class name in the definition and export', () => {
      const classDefCopy: ClassDeclaration = structuredClone(classDef);
      const moduleDocCopy: Module = structuredClone(moduleDoc);
      applySuperclassTransformMangleClass(classDefCopy, moduleDocCopy, {
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
    });
  });

  describe('when there is a transformer for the superclass, but it does not alter the name', () => {
    it('does not change any of the input variables', () => {
      const classDefCopy: ClassDeclaration = structuredClone(classDef);
      const moduleDocCopy: Module = structuredClone(moduleDoc);
      applySuperclassTransformMangleClass(classDefCopy, moduleDocCopy, {
        ['my-library']: {
          '*': (token: string) => token.replace('NoMatch', 'Super'),
        },
      });
      expect(classDefCopy).toEqual(classDef);
      expect(moduleDocCopy).toEqual(moduleDoc);
    });
  });
});
