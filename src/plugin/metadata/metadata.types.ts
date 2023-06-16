import { TemplateContext } from 'typescript-template-language-service-decorator';
import { DefinitionInfoAndBoundSpan, LineAndCharacter } from 'typescript/lib/tsserverlibrary';

export interface MetadataService {
  getDefinitionAndBoundSpan(
    context: TemplateContext,
    position: LineAndCharacter
  ): DefinitionInfoAndBoundSpan;
}
