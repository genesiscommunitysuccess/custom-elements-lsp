// TODO: Unit tests!

import { LineAndCharacter } from "typescript";
import { TemplateContext } from "typescript-template-language-service-decorator";
import { replaceTemplateStringBinding } from "../utils";
import { CompletionTypeParams } from "./completions.types";

// Unclosed tag, suggest any tag names
export const suggestTags = (line: string) => unfinishedTag.test(line);

// Returns the currently written custom element tag name, or false if not found
export const suggestCustomElements = (line: string) => {
  if (!unfinishedCustomElement.test(line)) return false;
  const lastTag = line.split(/</).pop() as string;
  return lastTag.split(" ")[0];
};

const unfinishedTag = /<[^>]*$/;

// Like an unfinished tag, but with a hyphen
const unfinishedCustomElement = /<.+-[^>]*$/;

export function getCompletionType(
  context: TemplateContext,
  position: LineAndCharacter
): CompletionTypeParams {
  const rawLine = context.rawText.split(/\n/g)[position.line];
  const processedLine = replaceTemplateStringBinding(rawLine);

  {
    let tagname: string | false;
    if (
      ((tagname = suggestCustomElements(
        processedLine.substring(0, position.character)
      )),
        tagname)
    ) {
      return {
        key: "custom-element-attribute",
        params: tagname,
      };
    }
  }

  if (suggestTags(rawLine)) {
    return {
      key: "custom-element-name",
      params: undefined,
    };
  }

  return {
    key: "none",
    params: undefined,
  };
}
