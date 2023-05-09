import {
  CompletionInfo,
  LineAndCharacter,
  ScriptElementKind,
} from "typescript";
import {
  TemplateContext,
  TemplateLanguageService,
} from "typescript-template-language-service-decorator";
import {
  CompletionEntry,
  Diagnostic,
  DiagnosticCategory,
} from "typescript/lib/tsserverlibrary";
import { CustomElementsResource } from "./transformer/custom-elements-resource";
import { LanguageServiceLogger } from "./utils";

import * as Completion from "./completions";
import parse from "node-html-parser";
import { DiagnosticsService } from "./diagnostics";

type CompletionTypeParams =
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

export class CustomElementsLanguageService implements TemplateLanguageService {
  constructor(
    private logger: LanguageServiceLogger,
    private ceResource: CustomElementsResource,
    private diagnostics: DiagnosticsService
  ) {
    logger.log("Setting up customelements class");
  }

  getSyntacticDiagnostics(context: TemplateContext): Diagnostic[] {
    const sourceFile = context.node.getSourceFile();

    const diagnostics: Diagnostic[] = [];

    this.logger.log(`getSyntacticDiagnostics: ${sourceFile.fileName}`);
    const root = parse(context.text);
    this.logger.log(`getCompletionsAtPosition: root: ${root.toString()}`);

    const elementList = root.querySelectorAll("*");

    this.diagnostics
      .getUnknownCETag(context, elementList)
      .forEach((diag) => diagnostics.push(diag));

    this.diagnostics
      .getInvalidCEAttribute(context, elementList)
      .forEach((diag) => diagnostics.push(diag));

    return diagnostics;
  }

  getCompletionsAtPosition(
    context: TemplateContext,
    position: LineAndCharacter
  ): CompletionInfo {
    this.logger.log(`getCompletionsAtPosition: ${JSON.stringify(position)}`);

    const { key, params } = this.getComptionType(context, position);
    this.logger.log(`getCompletionsAtPosition: ${key}, ${params}`);

    let entries: CompletionEntry[] = [];

    switch (key) {
      case "custom-element-name":
        entries = this.ceResource.getCENames().map((name) => ({
          name: name,
          insertText: `<${name}></${name}>`,
          kind: ScriptElementKind.typeElement,
          kindModifiers: "custom-element",
          sortText: "custom-element",
        }));
        break;

      case "custom-element-attribute":
        const attrs = this.ceResource.getCEAttributes(params);
        this.logger.log(
          `custom-element-attribute: ${params}, ${JSON.stringify(attrs)}`
        );
        entries = attrs.map(({ name, type }) => ({
          name,
          insertText: `${name}=""`,
          kind: ScriptElementKind.parameterElement,
          kindModifiers: "custom-element-attribute",
          sortText: "custom-element-attribute",
        }));
        if (entries.length > 0) break;

        // Else, we need to finish the name
        this.logger.log(`custom-element-attribute: name completion`);
        entries = this.ceResource.getCENames().map((name) => ({
          name: name,
          insertText: `<${name}></${name}>`,
          kind: ScriptElementKind.typeElement,
          kindModifiers: "custom-element",
          sortText: "custom-element",
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
        ((tagname = Completion.suggestCustomElements(
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

    if (Completion.suggestTags(rawLine)) {
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
