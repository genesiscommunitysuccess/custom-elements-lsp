import { Logger } from "typescript-template-language-service-decorator";
import { CompletionInfo } from "typescript/lib/tsserverlibrary";
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
    logger.log("Setting up FAST Enhancement Completions Service");
  }

  getCompletionsAtPosition(
    completions: CompletionInfo,
    ctx: CompletionCtx
  ): CompletionInfo {
    return completions;
  }
}
