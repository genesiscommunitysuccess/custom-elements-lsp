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
      const classDefNoSuperclass: ClassDeclaration = {
        ...classDef,
        superclass: undefined,
      };
      let err: Error;
      try {
        applySuperclassTransformMangleClass(classDefNoSuperclass, { ...moduleDoc }, {});
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
        applySuperclassTransformMangleClass({ ...classDef }, { ...moduleDoc }, {});
      } catch (e) {
        err = e;
      }
      expect(err!.message).toEqual('Plugin config does not contain config for superclass package');
    });
  });

  describe('when there is no transform function or override config for the superclass', () => {
    it('does not change any of the input variables', () => {
      const classDefCopy: ClassDeclaration = {
        ...classDef,
      };
      const moduleDocCopy: Module = {
        ...moduleDoc,
      };
      applySuperclassTransformMangleClass(classDefCopy, moduleDocCopy, { ['my-library']: {} });
      expect(classDefCopy).toEqual(classDef);
      expect(moduleDocCopy).toEqual(moduleDoc);
    });
  });
});
