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
import { CustomElementsService } from "../custom-elements/custom-elements.types";
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
  constructor(
    private logger: Logger,
    private ceResource: CustomElementsService
  ) {
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
        entries = this.ceResource
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
        break;

      case "custom-element-attribute":
        const attrs = this.ceResource.getCEAttributes(params);
        this.logger.log(
          `custom-element-attribute: ${params}, ${JSON.stringify(attrs)}`
        );
        entries = attrs.map(({ name, type }) => ({
          name,
          insertText: `${name}${type === "boolean" ? "" : '=""'}`,
          kind: ScriptElementKind.parameterElement,
          kindModifiers: "custom-element-attribute",
          sortText: "custom-element-attribute",
        }));
        if (entries.length > 0) break;

        // Else, we need to finish the name
        this.logger.log(`custom-element-attribute: name completion`);
        entries = this.ceResource
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
