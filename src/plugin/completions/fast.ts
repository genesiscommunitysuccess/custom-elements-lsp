import {
  Logger,
  TemplateContext,
} from "typescript-template-language-service-decorator";
import {
  CompletionEntry,
  CompletionInfo,
  LineAndCharacter,
  ScriptElementKind,
  TextSpan,
} from "typescript/lib/tsserverlibrary";
import { getWholeTextReplcaementSpan } from "../utils";
import { Services } from "../utils/services.type";
import { CompletionCtx, PartialCompletionsService } from "./completions.types";

/**
 * If Microsoft FAST config is enabled then this service will provide
 * enhanced completions for FAST templating syntax.
 *
 * @remarks This should be used in conjunction with the CoreCompletionsServiceImpl
 * or another class which fully implements the CompletionsService interface.
 *
 * @privateRemarks as a PartialCompletionsService this class is not required to
 * implement every method of the CompletionsService interface if not required
 * for FAST.
 */
export class FASTCompletionsService implements PartialCompletionsService {
  constructor(private logger: Logger, private services: Services) {
    this.logger.log("Setting up FAST Enhancement Completions Service");
  }

  getCompletionsAtPosition(
    completions: CompletionInfo,
    { typeAndParam, position, context }: CompletionCtx
  ): CompletionInfo {
    const { key, params } = typeAndParam;

    let entries = completions.entries;

    switch (key) {
      case "custom-element-attribute":
        const replacementSpan = getWholeTextReplcaementSpan(position, context);
        entries = this.convertFastEventAttributes(
          completions.entries,
          replacementSpan
        );
        entries = entries.concat(
          this.addElementEventCompletions(replacementSpan, params)
        );
        this.logger.log(`entries: ${JSON.stringify(entries)}`);
        break;
    }

    return {
      ...completions,
      entries,
    };
  }

  private addElementEventCompletions(
    replacementSpan: TextSpan,
    tagName: string
  ): CompletionEntry[] {
    return this.services.customElements
      .getCEEvents(tagName)
      .map(({ name, referenceClass }) => ({
        name: `@${name}`,
        insertText: `@${name}="\${(x, c) => $1}"$0`,
        kind: ScriptElementKind.parameterElement,
        kindModifiers: "custom-element-event",
        sortText: "f",
        labelDetails: {
          description: `[attr] ${referenceClass}`,
        },
        isSnippet: true,
        replacementSpan,
      }));
  }

  private convertFastEventAttributes(
    completions: CompletionEntry[],
    replacementSpan: TextSpan
  ): CompletionEntry[] {
    return completions.map((completion) => {
      if (completion.kindModifiers === "event-attribute") {
        return {
          ...completion,
          name: completion.name.replace("on", "@"),
          insertText: completion.insertText
            ?.replace("on", "@")
            .replace('""', '"${(x,c) => $1}"$0'),
          isSnippet: true,
          replacementSpan,
        };
      }
      return completion;
    });
  }
}
