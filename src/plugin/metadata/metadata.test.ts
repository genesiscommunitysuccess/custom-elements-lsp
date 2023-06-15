import resolvePkg from 'resolve-pkg';
import { getCEServiceFromStubbedResource } from '../../jest/custom-elements';
import { getGDServiceFromStubbedResource } from '../../jest/global-data';
import { buildServices, getLogger } from '../../jest/utils';
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

describe('tryFindPathOfDependencyFile', () => {
  beforeEach(() => {
    (resolvePkg as jest.Mock).mockReset();
  });
  const baseFakeIOService: IOService = {
    fileExists: jest.fn(),
    readFile: jest.fn(),
    getNormalisedRootPath: jest.fn(),
    getLocationOfStringInFile: jest.fn(),
  };

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
