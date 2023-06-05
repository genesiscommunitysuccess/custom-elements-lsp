import { CompletionInfo, LineAndCharacter } from 'typescript/lib/tsserverlibrary';
import { TemplateContext } from 'typescript-template-language-service-decorator';

export type CompletionTypeParams =
  | {
      key: 'none';
      params: undefined;
    }
  | {
      key: 'custom-element-name';
      params: undefined;
    }
  | {
      key: 'custom-element-attribute';
      params: string;
    };

export type CompletionCtx = {
  context: TemplateContext;
  position: LineAndCharacter;
  typeAndParam: CompletionTypeParams;
};

export interface CompletionsService {
  getCompletionsAtPosition(completions: CompletionInfo, ctx: CompletionCtx): CompletionInfo;
}

export interface PartialCompletionsService extends Partial<CompletionsService> {}
