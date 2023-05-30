import {
  Logger,
  TemplateContext,
} from "typescript-template-language-service-decorator";
import {
  CompletionEntry,
  CompletionInfo,
  LineAndCharacter,
  TextSpan,
} from "typescript/lib/tsserverlibrary";
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
        const replacementSpan = this.getEventReplacementSpan({
          tagName: params,
          position,
          context,
        });
        entries = this.convertFastEventAttributes(
          completions.entries,
          replacementSpan
        );
        break;
    }

    return {
      ...completions,
      entries,
    };
  }

  // TODO: If we come across `tagName` we should quit
  private getEventReplacementSpan({
    tagName,
    position,
    context,
  }: {
    tagName: string;
    position: LineAndCharacter;
    context: TemplateContext;
  }): TextSpan {
    const replacementSpan = { start: context.toOffset(position), length: 0 };
    while (context.text[replacementSpan.start] !== " ") {
      replacementSpan.start -= 1;
      replacementSpan.length += 1;
    }
    replacementSpan.start += 1;
    replacementSpan.length -= 1;
    return replacementSpan;
  }

  // TODO: Need to account for events from the manifest too
  // Completion seems to stop if '@' is written
  // Need to update the inserttext
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
