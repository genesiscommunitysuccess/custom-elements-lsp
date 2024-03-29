import {
  DefinitionInfoAndBoundSpan,
  LineAndCharacter,
  QuickInfo,
  TextSpan,
} from 'typescript/lib/tsserverlibrary';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import { TokenType } from '../utils';

export interface MetadataService {
  getDefinitionAndBoundSpan(
    context: TemplateContext,
    position: LineAndCharacter,
  ): DefinitionInfoAndBoundSpan;

  getQuickInfoAtPosition(ctx: QuickInfoCtx): QuickInfo | undefined;
}

export interface PartialMetadataService extends Partial<MetadataService> {}

export type QuickInfoCtx = {
  context: TemplateContext;
  position: LineAndCharacter;
  tokenSpan: TextSpan;
  token: string;
  typeAndParam: TokenType;
  result: QuickInfo | undefined;
};
