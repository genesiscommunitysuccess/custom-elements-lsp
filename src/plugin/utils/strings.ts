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
  return line.replace(/="\${(.+?)}"/g, (...args) => {
    return '=$"{' + "y".repeat(args[1].length) + '}"';
  });
}
