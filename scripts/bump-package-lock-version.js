// Using @google/semantic-release-replace-plugin to replace versions is not safe
// because it can accidentally bump version of one of the dependencies.
// This script makes sure we only update our own version
const { writeFileSync } = require('fs');

const writeJSON = (json, path) => {
  const data = JSON.stringify(json, null, 2) + '\n';
  console.log(`Updating version data in ${path}`);
  try {
    writeFileSync(path, data);
  } catch (e) {
    console.log(e);
  }
};

const packageLock = require('../package-lock.json');
const package = require('../package.json');

packageLock.version = package.version;
packageLock.packages[''].version = package.version;
if (packageLock.packages[''].devDependencies['@genesislcap/genx']) {
  packageLock.packages[''].devDependencies['@genesislcap/genx'] = `^${package.version}`;
}
writeJSON(packageLock, './package-lock.json');

if (package.devDependencies['@genesislcap/genx']) {
  package.devDependencies['@genesislcap/genx'] = `^${package.version}`;
  writeJSON(package, './package.json');
}
