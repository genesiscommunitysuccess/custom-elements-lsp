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
 * Get a `ReplacementSpan` which is a slice of the string containing all word characters before cursor.
 * @remarks
 * VSCode doesn't account for characters such as "`@`" when matching on the completions returned by the LSP, meaning a string such as `@cl` will not show `@click` as an option in VSCode.
 * We can force it to account for the character by manually returning a `ReplacementSpan`. This points from the first non-space character behind the cursor, to the cursor.
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
