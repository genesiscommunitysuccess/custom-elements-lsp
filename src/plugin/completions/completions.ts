import {
  Logger,
  TemplateContext,
} from "typescript-template-language-service-decorator";
import {
  CompletionEntry,
  CompletionInfo,
  LineAndCharacter,
  ScriptElementKind,
} from "typescript/lib/tsserverlibrary";
import { getStore } from "../utils/kvstore";
import { Services } from "../utils/services.type";
import { suggestCustomElements, suggestTags } from "./helpers";

export type CompletionTypeParams =
  | {
      key: "none";
      params: undefined;
    }
  | {
      key: "custom-element-name";
      params: undefined;
    }
  | {
      key: "custom-element-attribute";
      params: string;
    };

export class CompletionsService {
  constructor(private logger: Logger, private services: Services) {
    logger.log("Setting up Completions Service");
  }

  getCompletionsAtPosition(
    context: TemplateContext,
    position: LineAndCharacter
  ): CompletionInfo {
    const { key, params } = this.getComptionType(context, position);
    this.logger.log(`getCompletionsAtPosition: ${key}, ${params}`);

    let entries: CompletionEntry[] = [];

    switch (key) {
      case "custom-element-name":
        entries = this.getTagCompletions();
        break;

      case "custom-element-attribute":
        if (!this.services.customElements.customElementKnown(params)) {
          entries = this.getTagCompletions();
          break;
        }
        entries = this.getAttributeCompletions(params);
        break;

      case "none":
      default:
        // No suggestions
        break;
    }

    return {
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries,
    };
  }

  private getAttributeCompletions(tagName: string): CompletionEntry[] {
    const attrs = this.services.customElements.getCEAttributes(tagName);
    this.logger.log(
      `custom-element-attribute: ${tagName}, ${JSON.stringify(attrs)}`
    );

    const globalAttrs = getStore(this.logger).TSUnsafeGetOrAdd(
      "global-attributes",
      () =>
        this.services.globalData
          .getAttributes()
          .map((name) => ({
            name,
            insertText: `${name}=""`,
            kind: ScriptElementKind.parameterElement,
            kindModifiers: "global-attribute",
            sortText: "m",
            labelDetails: {
              description: "[attr] Global",
            },
          }))
          .concat(
            this.services.globalData.getAriaAttributes().map((name) => ({
              name,
              insertText: `${name}=""`,
              kind: ScriptElementKind.parameterElement,
              kindModifiers: "aria-attribute",
              sortText: "z",
              labelDetails: {
                description: "[attr] Aria",
              },
            }))
          )
    );

    return attrs
      .map(({ name, type, referenceClass }) => ({
        name,
        insertText: `${name}${type === "boolean" ? "" : '=""'}`,
        kind: ScriptElementKind.parameterElement,
        kindModifiers: "custom-element-attribute",
        sortText: "a",
        labelDetails: {
          description: `[attr] ${referenceClass}`,
        }
      }))
      .concat(globalAttrs);
  }

  private getTagCompletions(): CompletionEntry[] {
    return this.services.customElements
      .getCEInfo({ getFullPath: false })
      .map(({ tagName: name, path }) => ({
        name: name,
        insertText: `${name}></${name}>`,
        kind: ScriptElementKind.typeElement,
        kindModifiers: "custom-element",
        sortText: "custom-element",
        labelDetails: {
          description: path,
        },
      }));
  }

  private getComptionType(
    context: TemplateContext,
    position: LineAndCharacter
  ): CompletionTypeParams {
    const rawLine = context.rawText.split(/\n/g)[position.line];

    {
      let tagname: string | false;
      if (
        ((tagname = suggestCustomElements(
          rawLine.substring(0, position.character)
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
}
