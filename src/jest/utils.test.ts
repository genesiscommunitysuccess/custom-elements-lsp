import { html } from "./utils";

/**
 * These test cases are checked against the values produced by the LSP
 * It converts the line and col position into a single value which represents
 * the offset into the string if you consider the multi-line string as a single line.
 *
 * The whitespace from indentation is counted, these test cases are formatted in the way
 * they are specifically and changing the formatting/indentation will change the offset
 * and break the tests.
 */

const testCaseOne = html`<template-1></template-1>`;
const testCaseTwo = html` <template-2></template-2>`;
const testCaseThree = html`<div></div>
  <template-3></template-3>`;
const testCaseFour = html`<template>
  <div>
    <invalid-ce></invalid-ce>
    <test-ce></test-ce>
  </div>
</template>`;

// This looks strange because it is testing a template string that is defined on the second indentation level
function getTestCaseFive() {
  return (() =>
    html`<template>
      <div>
        <test-ce></test-ce>
        <invalid-ce></invalid-ce>
      </div>
    </template>`)();
}

describe("toOffset", () => {
  it("Returns the correct offset for a single line", () => {
    // Info 171  [12:59:37.893] [CE] getUnknownCETag: offsets: 1
    const res = testCaseOne.toOffset({
      line: 0,
      character: testCaseOne.rawText.split("\n")[0].indexOf("template-1"),
    });
    expect(res).toBe(1);
  });

  it("Returns the correct offset with a space", () => {
    // Info 178  [12:59:37.893] [CE] getUnknownCETag: offsets: 2
    const res = testCaseTwo.toOffset({
      line: 0,
      character: testCaseTwo.rawText.split("\n")[0].indexOf("template-2"),
    });
    expect(res).toBe(2);
  });

  it("Returns the correct offset with a second line", () => {
    // Info 178  [13:32:23.820] [CE] getUnknownCETag: offsets: 15
    const res = testCaseThree.toOffset({
      line: 1,
      character: testCaseThree.rawText.split("\n")[1].indexOf("template-3"),
    });
    expect(res).toBe(15);
  });

  it("Returns the correct with multiple values", () => {
    // Info 164  [12:59:37.893] [CE] getUnknownCETag: offsets: 24, 54
    const res = testCaseFour.toOffset({
      line: 2,
      character: testCaseFour.rawText.split("\n")[2].indexOf("invalid-ce"),
    });
    expect(res).toBe(24);

    const res2 = testCaseFour.toOffset({
      line: 3,
      character: testCaseFour.rawText.split("\n")[3].indexOf("test-ce"),
    });
    expect(res2).toBe(54);
  });

  it("Returns the correct with multiple values, that are indented in the page", () => {
    // Info 164  [13:46:01.335] [CE] getUnknownCETag: offsets: 32, 60
    const testCaseFive = getTestCaseFive();
    const res = testCaseFive.toOffset({
      line: 2,
      character: testCaseFive.rawText.split("\n")[2].indexOf("test-ce"),
    });
    expect(res).toBe(32);

    const res2 = testCaseFive.toOffset({
      line: 3,
      character: testCaseFive.rawText.split("\n")[3].indexOf("invalid-ce"),
    });
    expect(res2).toBe(60);
  });
});
