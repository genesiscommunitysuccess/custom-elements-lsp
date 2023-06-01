// TODO: Unit tests!

import { TemplateContext } from "typescript-template-language-service-decorator";
import {
  CompletionEntry,
  LineAndCharacter,
  ScriptElementKind,
} from "typescript/lib/tsserverlibrary";
import { GlobalAttrType } from "../global-data/global-data.types";
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

export function constructGlobalAriaCompletion(name: string): CompletionEntry {
  return {
    name,
    insertText: `${name}=""`,
    kind: ScriptElementKind.parameterElement,
    sortText: "z",
    labelDetails: {
      description: "[attr] Aria",
    },
  };
}

export function constructGlobalEventCompletion(name: string): CompletionEntry {
  return {
    name,
    insertText: `${name}=""`,
    kind: ScriptElementKind.parameterElement,
    sortText: "z",
    labelDetails: {
      description: "[attr] Event",
      detail: " event",
    },
  };
}

export function constructGlobalAttrCompletion(
  name: string,
  type: GlobalAttrType
): CompletionEntry {
  switch (type) {
    case "string":
      return {
        name,
        insertText: `${name}=""`,
        kind: ScriptElementKind.parameterElement,
        sortText: "m",
        labelDetails: {
          description: "[attr] Global",
          detail: " string",
        },
      };
    case "boolean":
      return {
        name,
        insertText: name,
        kind: ScriptElementKind.parameterElement,
        sortText: "m",
        labelDetails: {
          description: "[attr] Global",
          detail: " boolean",
        },
      };
    case "wildcard":
      return {
        name,
        insertText: name.replace("*", '$1="${$2}"$0'),
        isSnippet: true,
        kind: ScriptElementKind.parameterElement,
        sortText: "m",
        labelDetails: {
          description: "[attr] Global",
          detail: " string",
        },
      };
  }
}
