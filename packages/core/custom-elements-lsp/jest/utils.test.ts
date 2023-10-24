import { LineAndCharacter } from 'typescript/lib/tsserverlibrary';
import { TemplateContext } from 'typescript-template-language-service-decorator';
// eslint-disable-next-line camelcase
import { STRINGS__TOKEN_TYPE_empty_attr } from './shaped-test-cases';
import { html } from './utils';

/**
 * These test cases are checked against the values produced by the LSP
 * It converts the line and col position into a single value which represents
 * the offset into the string if you consider the multi-line string as a single line.
 *
 * The whitespace from indentation is counted, these test cases are formatted in the way
 * they are specifically and changing the formatting/indentation will change the offset
 * and break the tests.
 */

const testCaseOne = html`
  <template-1></template-1>
`;
const testCaseTwo = html`
  <template-2></template-2>
`;
const testCaseThree = html`
  <div></div>
  <template-3></template-3>
`;
const testCaseFour = html`
  <template>
    <div>
      <invalid-ce></invalid-ce>
      <test-ce></test-ce>
    </div>
  </template>
`;

// This looks strange because it is testing a template string that is defined on the second indentation level
function getTestCaseFive() {
  return (() => html`
    <template>
      <div>
        <test-ce></test-ce>
        <invalid-ce></invalid-ce>
      </div>
    </template>
  `)();
}

describe('toOffset', () => {
  it('Returns the correct offset for a single line', () => {
    const res = testCaseOne.toOffset({
      line: 1,
      character: testCaseOne.rawText.split('\n')[1].indexOf('template-1'),
    });
    expect(res).toBe(4);
  });

  it('Returns the correct offset with a space', () => {
    // Info 178  [12:59:37.893] [CE] diagnosticsUnknownTags: offsets: 2
    const res = testCaseTwo.toOffset({
      line: 1,
      character: testCaseTwo.rawText.split('\n')[1].indexOf('template-2'),
    });
    expect(res).toBe(4);
  });

  it('Returns the correct offset with a second line', () => {
    // Info 178  [13:32:23.820] [CE] diagnosticsUnknownTags: offsets: 15
    const res = testCaseThree.toOffset({
      line: 2,
      character: testCaseThree.rawText.split('\n')[2].indexOf('template-3'),
    });
    expect(res).toBe(18);
  });

  it('Returns the correct with multiple values', () => {
    const res = testCaseFour.toOffset({
      line: 3,
      character: testCaseFour.rawText.split('\n')[3].indexOf('invalid-ce'),
    });
    expect(res).toBe(31);

    const res2 = testCaseFour.toOffset({
      line: 4,
      character: testCaseFour.rawText.split('\n')[4].indexOf('test-ce'),
    });
    expect(res2).toBe(63);
  });

  it('Returns the correct with multiple values, that are indented in the page', () => {
    // Info 164  [13:46:01.335] [CE] diagnosticsUnknownTags: offsets: 32, 60
    const testCaseFive = getTestCaseFive();
    const res = testCaseFive.toOffset({
      line: 3,
      character: testCaseFive.rawText.split('\n')[3].indexOf('test-ce'),
    });
    expect(res).toBe(43);

    const res2 = testCaseFive.toOffset({
      line: 4,
      character: testCaseFive.rawText.split('\n')[4].indexOf('invalid-ce'),
    });
    expect(res2).toBe(73);
  });
});

describe('toPosition', () => {
  // Test values from the LSP
  // Test case 5
  // Info 219  [15:03:37.039] [CE] getQuickInfoAtPosition: {"line":3,"character":18} 50
  // Info 224  [15:06:22.681] [CE] getQuickInfoAtPosition: {"line":4,"character":21} 83
  // Test case 3
  // Info 281  [15:07:03.043] [CE] getQuickInfoAtPosition: {"line":2,"character":13} 28

  const testCases: [[TemplateContext, number], LineAndCharacter][] = [
    [[getTestCaseFive(), 50], { line: 3, character: 18 }],
    [[getTestCaseFive(), 83], { line: 4, character: 21 }],
    [[testCaseThree, 28], { line: 2, character: 13 }],
  ];

  testCases.forEach(([[context, lineAndChar], expected], i) => {
    it(`Case ${i}`, () => expect(context.toPosition(lineAndChar)).toEqual(expected));
  });
});

describe('rawText', () => {
  it('Preserves the interpolation syntax characters ${}', () => {
    // eslint-disable-next-line camelcase
    expect(STRINGS__TOKEN_TYPE_empty_attr.rawText).toEqual(`
  <person-avatar id="" @click="\${(x, c) => true}" ></person-avatar>
`);
  });
});
