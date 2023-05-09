// TODO: Unit tests!

// Unclosed tag, suggest any tag names
export const suggestTags = (line: string) => unfinishedTag.test(line);

// Returns the currently written custom element tag name, or false if not found
export const suggestCustomElements = (line: string) => {
  if (!unfinishedCustomElement.test(line)) return false;
  const lastTag = line.split(/</).pop() as string;
  return lastTag.split(' ')[0];
}

// <div></div>
// <input />
// <
// <di
// <div
// <div></div><
// <div></div><di
// <div></div><di
// <div></div><>
// <div></div><di>
// <div></div><di>
const unfinishedTag = /<[^>]*$/;

// <test-
// <test-a
// <test-ab></test-ab><tes-
// <test-a test=
// <test-a test=
// Like an unfinished tag, but with a hyphen
const unfinishedCustomElement = /<.+-[^>]*$/;
