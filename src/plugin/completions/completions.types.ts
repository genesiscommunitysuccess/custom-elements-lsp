import { CompletionInfo, LineAndCharacter } from 'typescript/lib/tsserverlibrary';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import { TokenType } from '../utils';

export type CompletionCtx = {
  context: TemplateContext;
  position: LineAndCharacter;
  typeAndParam: TokenType;
};

export interface CompletionsService {
  getCompletionsAtPosition(completions: CompletionInfo, ctx: CompletionCtx): CompletionInfo;
}

export interface PartialCompletionsService extends Partial<CompletionsService> {}
