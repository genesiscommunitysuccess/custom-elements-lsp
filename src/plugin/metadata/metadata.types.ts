import { TemplateContext } from 'typescript-template-language-service-decorator';
import {
  DefinitionInfoAndBoundSpan,
  LineAndCharacter,
  QuickInfo,
} from 'typescript/lib/tsserverlibrary';

export interface MetadataService {
  getDefinitionAndBoundSpan(
    context: TemplateContext,
    position: LineAndCharacter
  ): DefinitionInfoAndBoundSpan;

  getQuickInfoAtPosition(
    context: TemplateContext,
    position: LineAndCharacter
  ): QuickInfo | undefined;
}
