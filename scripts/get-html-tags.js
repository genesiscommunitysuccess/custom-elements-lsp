// Used as a manual step to generate the html attribute data in `tagnames.ts`
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element

// Ignore last table as it contains obsolete and deprecated tags
const tables = [...document.querySelectorAll('table')].slice(0, -1);

const elems = tables.reduce((acum, table) => {
  const rows = [...table.querySelectorAll('tr')];
  const tableElems = rows.reduce((tAcum, tr, i) => {
    if (i === 0) return tAcum;
    const [name, desc] = tr.querySelectorAll('td');
    const tagName = name.innerText.replaceAll('<', '').replaceAll('>', '').trim();
    return {
      ...tAcum,
      [tagName]: {
        desc: desc.innerText,
      },
    };
  }, {});
  return {
    ...acum,
    ...tableElems,
  };
}, {});

// Handle tags that are comma separated on the same row e.g. h1,h2,h3,h4,h5,h6
const groupedTags = Object.keys(elems)
  .filter((name) => name.includes(','))
  .reduce(
    (acum, name) => ({
      ...acum,
      [name]: elems[name],
    }),
    {}
  );
const seperatedTag = Object.keys(groupedTags).reduce((acum, groupName) => {
  const splitNames = groupName.split(',').map((x) => x.trim());
  const seperated = splitNames.reduce(
    (gAcum, tagName) => ({
      ...gAcum,
      [tagName]: groupedTags[groupName],
    }),
    {}
  );
  return {
    ...acum,
    ...seperated,
  };
}, {});
Object.keys(groupedTags).forEach((groupTag) => delete elems[groupTag]);

console.log(JSON.stringify({ ...elems, ...seperatedTag }));
