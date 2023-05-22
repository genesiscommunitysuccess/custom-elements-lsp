import { Logger } from "typescript-template-language-service-decorator";
import {
  CompletionEntry,
  CompletionInfo,
  ScriptElementKind,
} from "typescript/lib/tsserverlibrary";
import { getStore } from "../utils/kvstore";
import { Services } from "../utils/services.type";
import { CompletionCtx, CompletionsService } from "./";

export class CoreCompletionsServiceImpl implements CompletionsService {
  constructor(private logger: Logger, private services: Services) {
    logger.log("Setting up Completions Service");
  }

  getCompletionsAtPosition(
    completions: CompletionInfo,
    { typeAndParam }: CompletionCtx
  ): CompletionInfo {
    const { key, params } = typeAndParam;

    let baseEntries: CompletionEntry[] = [];

    switch (key) {
      case "custom-element-name":
        baseEntries = this.getTagCompletions();
        break;

      case "custom-element-attribute":
        if (!this.services.customElements.customElementKnown(params)) {
          baseEntries = this.getTagCompletions();
          break;
        }
        baseEntries = this.getAttributeCompletions(params);
        break;

      case "none":
      default:
        // No suggestions
        break;
    }

    return {
      ...completions,
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries: completions.entries.concat(baseEntries),
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
        },
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
}
