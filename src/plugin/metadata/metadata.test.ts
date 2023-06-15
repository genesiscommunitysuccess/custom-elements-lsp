import resolvePkg from 'resolve-pkg';
import { TextSpan } from 'typescript/lib/tsserverlibrary';
import { getCEServiceFromStubbedResource } from '../../jest/custom-elements';
import { getGDServiceFromStubbedResource } from '../../jest/global-data';
import { buildServices, getLogger, html } from '../../jest/utils';
import { CustomElementsService } from '../custom-elements/custom-elements.types';
import { GlobalDataRepository } from '../global-data/global-data.types';
import { CoreMetadataService } from './metadata';
import { IOService } from '../utils';
import { getIOServiceFromStubResource } from '../../jest/io';

jest.mock('resolve-pkg', () => jest.fn());

const getMetadataService = ({
  ce = getCEServiceFromStubbedResource(),
  gd = getGDServiceFromStubbedResource(),
  io = getIOServiceFromStubResource({}),
}: {
  ce?: CustomElementsService;
  gd?: GlobalDataRepository;
  io?: IOService;
}) =>
  new CoreMetadataService(getLogger(), buildServices({ customElements: ce, globalData: gd, io }));

const baseFakeIOService: IOService = {
  fileExists: jest.fn(),
  readFile: jest.fn(),
  getNormalisedRootPath: jest.fn(),
  getLocationOfStringInFile: jest.fn(),
};

describe('tryFindPathOfDependencyFile', () => {
  beforeEach(() => {
    (resolvePkg as jest.Mock).mockReset();
  });

  it('returns null if we are unable to get the package name of the tag', () => {
    const service = getMetadataService({});
    const res = (service as any).tryFindPathOfDependencyFile('unknown-elem', '');
    expect(res).toBeNull();
  });

  it('returns null if we are unable to resolve the package name on the file system', () => {
    const service = getMetadataService({});
    (resolvePkg as jest.Mock).mockImplementationOnce(() => null);
    const res = (service as any).tryFindPathOfDependencyFile('no-attr', '');
    expect(res).toBeNull();
    expect(resolvePkg).toHaveBeenCalledWith('pkg');
    expect(resolvePkg).toHaveBeenCalledTimes(1);
  });

  it('returns the entire path from / if the source file is bundled', () => {
    const fakeIOService: IOService = {
      ...baseFakeIOService,
      fileExists: jest.fn().mockImplementationOnce(() => true),
    };
    const service = getMetadataService({ io: fakeIOService });
    (resolvePkg as jest.Mock).mockImplementationOnce(() => '/path/to/pkg');
    const res = (service as any).tryFindPathOfDependencyFile(
      'no-attr',
      'node_modules/pkg/dist/src/components/misc/no-attr.ts'
    );
    expect(res).toBe('/path/to/pkg/dist/src/components/misc/no-attr.ts');
  });

  it('returns the path to the esm javascript output if found, if the source file is not', () => {
    const fakeIOService: IOService = {
      ...baseFakeIOService,
      fileExists: jest
        .fn()
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => true),
    };
    const service = getMetadataService({ io: fakeIOService });
    (resolvePkg as jest.Mock).mockImplementationOnce(() => '/path/to/pkg');
    const res = (service as any).tryFindPathOfDependencyFile(
      'no-attr',
      'node_modules/pkg/dist/src/components/misc/no-attr.ts'
    );
    expect(res).toBe('/path/to/pkg/dist/esm/components/misc/no-attr.js');
    expect(fakeIOService.fileExists).toHaveBeenCalledTimes(2);
  });

  it('returns null if the esm javascript file is not found either', () => {
    const fakeIOService: IOService = {
      ...baseFakeIOService,
      fileExists: jest
        .fn()
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false),
    };
    const service = getMetadataService({ io: fakeIOService });
    (resolvePkg as jest.Mock).mockImplementationOnce(() => '/path/to/pkg');
    const res = (service as any).tryFindPathOfDependencyFile(
      'no-attr',
      'node_modules/pkg/dist/src/components/misc/no-attr.ts'
    );
    expect(res).toBeNull();
    expect(fakeIOService.fileExists).toHaveBeenCalledTimes(2);
  });
});

describe('getCustomElementDefinitionInfo', () => {
  const tokenSpan: TextSpan = { start: 6, length: 14 };
  const context = html`
    <custom-element></custom-element>
  `;
  context.node.getStart = jest.fn().mockImplementation(() => 10);

  it('throws an error if the function is called with an unknown custom element', () => {
    const service = getMetadataService({});
    let err;
    try {
      (service as any).getCustomElementDefinitionInfo(tokenSpan, 'unknown-elem', context);
    } catch (error) {
      err = error;
    }
    expect((err as Error).message).toBe(
      "Couldn't find path for custom element with tagName: unknown-elem"
    );
  });

  it('returns the input text span with no definitions if we are unable to find the dependency file', () => {
    const fakeIOService: IOService = {
      ...baseFakeIOService,
      getNormalisedRootPath: jest.fn(),
    };
    const service = getMetadataService({ io: fakeIOService });
    const depFnSpy = jest.spyOn(service as any, 'tryFindPathOfDependencyFile');
    depFnSpy.mockImplementationOnce(() => null);
    const res = (service as any).getCustomElementDefinitionInfo(tokenSpan, 'no-attr', context);
    expect(res).toEqual({
      textSpan: tokenSpan,
    });
    expect(depFnSpy).toHaveBeenCalledTimes(1);
    expect(fakeIOService.getNormalisedRootPath).toHaveBeenCalledTimes(0);
  });

  it('throws an error if the io service indicates the file does not contain the input token', () => {
    const fakeIOService: IOService = {
      ...baseFakeIOService,
      getNormalisedRootPath: jest.fn().mockImplementationOnce(() => '/path/to/current/project/'),
      getLocationOfStringInFile: jest.fn().mockImplementationOnce(() => null),
    };
    const service = getMetadataService({ io: fakeIOService });
    let err;
    try {
      (service as any).getCustomElementDefinitionInfo(tokenSpan, 'custom-element', context);
    } catch (error) {
      err = error;
    }
    expect((err as Error).message).toBe(
      "Couldn't find definition for custom element with tagName: custom-element defined in file /path/to/current/project/src/components/avatar/avatar.ts"
    );
    expect(fakeIOService.getNormalisedRootPath).toHaveBeenCalledTimes(1);
    expect(fakeIOService.getLocationOfStringInFile).toHaveBeenCalledTimes(1);
    expect(fakeIOService.getLocationOfStringInFile).toHaveBeenCalledWith(
      '/path/to/current/project/src/components/avatar/avatar.ts',
      'custom-element'
    );
  });

  it('returns the definition and span for a locally defined custom element', () => {
    const fakeIOService: IOService = {
      ...baseFakeIOService,
      getNormalisedRootPath: jest.fn().mockImplementationOnce(() => '/path/to/current/project/'),
      getLocationOfStringInFile: jest.fn().mockImplementationOnce(() => 30),
    };
    const service = getMetadataService({ io: fakeIOService });
    const res = (service as any).getCustomElementDefinitionInfo(
      tokenSpan,
      'custom-element',
      context
    );
    expect(res).toEqual({
      textSpan: tokenSpan,
      definitions: [
        {
          containerKind: 'module',
          containerName: 'file',
          fileName: '/path/to/current/project/src/components/avatar/avatar.ts',
          kind: 'class',
          name: 'custom-element',
          textSpan: {
            length: 14,
            start: 19,
          },
        },
      ],
    });
    expect(fakeIOService.getNormalisedRootPath).toHaveBeenCalledTimes(1);
    expect(fakeIOService.getLocationOfStringInFile).toHaveBeenCalledTimes(1);
  });

  it('returns the definition and span for a custom element found in a dependency', () => {
    const fakeIOService: IOService = {
      ...baseFakeIOService,
      getNormalisedRootPath: jest.fn().mockImplementationOnce(() => null),
      getLocationOfStringInFile: jest.fn().mockImplementationOnce(() => 5),
    };
    const service = getMetadataService({ io: fakeIOService });
    const depFnSpy = jest.spyOn(service as any, 'tryFindPathOfDependencyFile');
    depFnSpy.mockImplementationOnce(
      () => '/path/to/current/project/node_modules/pkg/dist/esm/components/misc/no-attr.js'
    );

    const res = (service as any).getCustomElementDefinitionInfo(tokenSpan, 'no-attr', context);
    expect(res).toEqual({
      textSpan: tokenSpan,
      definitions: [
        {
          containerKind: 'module',
          containerName: 'file',
          fileName: '/path/to/current/project/node_modules/pkg/dist/esm/components/misc/no-attr.js',
          kind: 'class',
          name: 'no-attr',
          textSpan: {
            length: 7,
            start: 0,
          },
        },
      ],
    });
    expect(fakeIOService.getNormalisedRootPath).toHaveBeenCalledTimes(0);
    expect(fakeIOService.getLocationOfStringInFile).toHaveBeenCalledTimes(1);
    expect(depFnSpy).toHaveBeenCalledTimes(1);
  });
});
