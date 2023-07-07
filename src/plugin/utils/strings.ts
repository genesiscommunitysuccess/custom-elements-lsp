import { LineAndCharacter, TextSpan } from 'typescript/lib/tsserverlibrary';
import { TemplateContext } from 'typescript-template-language-service-decorator';

/**
 * Replace the content of a attribute binding in a template string interpolation region with `y`.
 * @privateRemarks
 * Regions inside of a `${}` block are standard js/ts and hence are not the remit of the custom elements LSP plugin.
 * Therefore we do not care about the contents of the template string and transform all of the contained text to `y` (avoiding confusion with the `rawString` from the `TemplateContext`).
 * Ideally we would use `rawString` but it squashes multiple lines of strings into a single line, so `LineAndCharacter` would be off.
 * @example
 * ```
 * `hello="${x => x.action()}"` -> `hello="${yyyyyyyyyyyyyyy}"`
 * ````
 */
export function replaceTemplateStringBinding(line: string): string {
  return line.replace(/\${(.+?)}/g, (...args) => {
    return '${' + 'y'.repeat(args[1].length) + '}';
  });
}

/**
 * Get a `TextSpan` object which is the span of the token at the given position, where the token matches the given pattern. Could be used to find the span of a custom element name, or an attribute name, etc.
 *
 * @remarks Returns `null` if no token is provided from matched pattern, or other invalid scenarios.
 *
 * @example
 * ```
 * const str = "   <my-element attr='test'>"
 * const position = {line: 0, character: 5}
 * const ptrn = /[\w-]/ // any word character or -
 *
 * // This will match the token describing the custom element name
 * ````
 */
export function getTokenSpanMatchingPattern(
  position: LineAndCharacter,
  context: TemplateContext,
  pattern: RegExp
): TextSpan | null {
  let offset = context.toOffset(position);
  if (offset < 0 || offset >= context.rawText.length) {
    return null;
  }
  if (!pattern.test(context.rawText[offset])) {
    return null;
  }

  while (pattern.test(context.rawText[offset])) {
    offset -= 1;
    if (offset < 0) {
      break;
    }
  }
  const start = offset + 1;
  let length = context.toOffset(position) - start;
  while (pattern.test(context.rawText[start + length])) {
    length += 1;
    if (start + length == context.rawText.length) {
      break;
    }
  }

  return {
    start,
    length,
  };
}

/**
 * Get a `TextSpan` which is a slice of the string containing all consecutive word characters before cursor.
 * @remarks
 * VSCode doesn't account for characters such as "`@`" when matching on the completions returned by the LSP, meaning a string such as `@cl` will not show `@click` as an option in VSCode.
 * We can force it to account for the character by manually returning a `ReplacementSpan` (which is a `TextSpan` object). This points from the first non-space character behind the cursor, to the cursor.
 */
export function getWholeTextReplacementSpan(
  position: LineAndCharacter,
  context: TemplateContext
): TextSpan {
  const replacementSpan = { start: context.toOffset(position), length: 0 };
  while (context.text[replacementSpan.start] !== ' ') {
    if (replacementSpan.start >= context.text.length || replacementSpan.start < 0) {
      throw new Error('Span out of bounds in context.text');
    }
    if (replacementSpan.start === 0) {
      return replacementSpan;
    }
    replacementSpan.start -= 1;
    replacementSpan.length += 1;
  }
  replacementSpan.start += 1;
  replacementSpan.length -= 1;
  return replacementSpan;
}

/**
 * Get the index in a string of the end of a substring, at a given occurrence
 *
 * @example
 * ```
 * fn({rawText: `hi hi`, substring: 'hi', occurrence: 1}) -> 2
 * fn({rawText: `hi hi`, substring: 'hi', occurrence: 2}) -> 5
 * ```
 */
export function getPositionOfNthOccuranceEnd({
  rawText,
  substring,
  occurrence,
}: {
  rawText: string;
  substring: string;
  occurrence: number;
}): number {
  if (occurrence < 1) {
    const INVALID_OCCURRENCE_CODE = -2;
    return INVALID_OCCURRENCE_CODE;
  }
  let countdown = occurrence;
  let stringIndex = 0;

  while (countdown > 0) {
    const nextOccurrenceIndex = rawText.indexOf(substring, stringIndex);
    if (nextOccurrenceIndex === -1) {
      return -1;
    }
    stringIndex = nextOccurrenceIndex + substring.length;
    countdown -= 1;
  }

  return stringIndex;
}

/**
 * Takes a string of attributes and returns an array of attribute names
 *
 * @remarks The HTML node interface in use exposes a `.attributes` property,
 * but this does not contain duplicate attributes. We need to be aware of duplicates
 * for our use case so we need to parse it ourselves. This function will return
 * an array of attribute names from a string of attributes, accounting for `@:?` symbols.
 * We don't care about the values for our use case so they're ignored. Checking the semantic
 * diagnostic that the value matches the type of the attribute is outside of the remit of this plugin.
 *
 * @example
 * ```
 * fn('testone testone="test" ?testone="${x => true}" :testone="${(x,c) => x.action()}"')
 * -> ['testone', 'testone', '?testone', ':testone']
 * ```
 */
export function parseAttrNamesFromRawString(rawString: string): string[] {
  return replaceTemplateStringBinding(rawString)
    .split(' ')
    .map((token) => {
      const attrRegex = /([\w-?:@]+)(?:=.+)?/g;
      const regexExpArr = attrRegex.exec(token.trim());
      return regexExpArr?.[1];
    })
    .filter((x) => x) as string[];
}

const tokenParseHelper = (() => {
  const unfinishedTag = /<[^>]*$/;
  // Like an unfinished tag, but with a hyphen
  const unfinishedCustomElement = /<.+-[^>]*$/m;

  // Unclosed tag, suggest any tag names
  const suggestTags = (line: string) => unfinishedTag.test(line);
  // Returns the currently written custom element tag name, or false if not found
  const suggestCustomElements = (line: string) => {
    if (!unfinishedCustomElement.test(line)) return false;
    const lastTag = line.split(/</).pop() as string;
    return lastTag.split(' ')[0].trim();
  };
  return {
    suggestTags,
    suggestCustomElements,
  };
})();

export type TokenUnderCursorType =
  | {
      key: 'none';
      params: undefined;
    }
  | {
      key: 'custom-element-name';
      params: undefined;
    }
  | {
      key: 'custom-element-attribute';
      params: {
        tagName: string;
      };
    };

/**
 * Returns the `TokenUnderCursorType` for the token under the cursor.
 *
 * @example
 * ```
 * const res =getTokenTypeWithInfo({rawText: `<cus-el attr`, position: {line: 0, character: 13}})
 * // res.key -> 'custom-element-attribute'
 * // res.params.tagName -> 'cus-el'
 * ```
 */
export function getTokenTypeWithInfo(
  context: TemplateContext,
  position: LineAndCharacter
): TokenUnderCursorType {
  const processedLine = replaceTemplateStringBinding(
    context.rawText.substring(0, context.toOffset(position))
  );

  {
    let tagName: string | false;
    if (((tagName = tokenParseHelper.suggestCustomElements(processedLine)), tagName)) {
      return {
        key: 'custom-element-attribute',
        params: {
          tagName,
        },
      };
    }
  }

  if (tokenParseHelper.suggestTags(processedLine)) {
    return {
      key: 'custom-element-name',
      params: undefined,
    };
  }

  return {
    key: 'none',
    params: undefined,
  };
}

export function stringHeadTail(str: string): [string, string] {
  return [str.slice(0, 1), str.slice(1)];
}
