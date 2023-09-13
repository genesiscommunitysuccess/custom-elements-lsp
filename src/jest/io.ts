import { IORepository, IOService, IOServiceImpl } from '../custom-elements-plugin/utils';

export function getIOServiceFromStubResource(overrides: Partial<IORepository>): IOService {
  const repo: IORepository = {
    getNormalisedRootPath() {
      return '/home/user/project';
    },
    fileExists(path) {
      return path.includes('exists');
    },
    readFile(path) {
      return `
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Enim sit amet venenatis urna cursus eget nunc. Netus et malesuada fames ac turpis egestas integer eget aliquet. Sagittis nisl rhoncus mattis rhoncus urna. Quis varius quam quisque id diam. A iaculis at erat pellentesque adipiscing commodo elit at imperdiet. Ullamcorper morbi tincidunt ornare massa.
`;
    },
    ...overrides,
  };

  return new IOServiceImpl(repo);
}
