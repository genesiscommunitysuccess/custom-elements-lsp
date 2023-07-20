// Used as a manual step to generate the html attribute data in `html-attributes.ts`
// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
const table = document.querySelector('section[aria-labelledby="attribute_list"] table');
const rows = [...table.querySelectorAll('tr')];

const tableData = rows
  .map((tr, i) => {
    const [name, elems, desc] = tr.querySelectorAll('td');
    if (i === 0) return;
    const elemsText = elems.innerText;
    if (elemsText.includes('Global attribute')) return;
    const elemsArr = elemsText
      .replaceAll('<', '')
      .replaceAll('>', '')
      .split(',')
      .map((x) => x.trim());
    return {
      name: name.innerText.split('\n')[0].trim(),
      desc: desc.innerText,
      type: desc.innerText.toLowerCase().includes('boolean') ? 'boolean' : 'string',
      deprecated: name.innerText.toLowerCase().includes('deprecated'),
      elemsArr,
    };
  })
  .filter((x) => !!x);

const allElems = new Set(tableData.reduce((elems, row) => elems.concat(row.elemsArr), []));

const elemAttrs = [...allElems.keys()].reduce((acum, elem) => {
  const attrs = tableData
    .filter(({ elemsArr }) => elemsArr.includes(elem))
    .map(({ name, desc, type, deprecated }) => ({ name, desc, type, deprecated }));
  return {
    ...acum,
    [elem]: attrs,
  };
}, {});

console.log(JSON.stringify(elemAttrs));
