import { JSDocTagInfo } from 'typescript/lib/tsserverlibrary';

/**
 * Constructs a tag section for JSDoc, accounting for different IDE formatting.
 * @remarks Different IDEs display the quickinfo section differently so this is a helper
 * function that abstracts away some of the fiddling we have to do to get it to format correctly.
 * To show attributes/events/properties on each line we need to use a tag section as a unordered list
 * and then have each line end with `\r\n` otherwise VSCode doesn't display it correctly. However,
 * having the end `\r\n` will make Nvim display the last value with an extra line break. So we need to
 * remove this, but only if there are more than 2 lines otherwise it breaks VSCode.
 */
export function buildAndAddJSDocTag(
  tags: JSDocTagInfo[],
  name: string,
  fn: () => JSDocTagInfo['text'],
): boolean {
  const text = fn()?.map(({ kind, text: tagText }) => ({
    kind,
    text: `- ${tagText}\r\n`,
  }));
  if (typeof text === 'undefined' || text.length === 0) {
    return false;
  }
  if (text!.length >= 2) {
    text[text.length - 1].text = text[text.length - 1].text.replace('\r\n', '');
  }
  tags.push({ name, text });
  return true;
}
