import { Logger } from 'typescript-template-language-service-decorator';
import { PartialCompletionsService } from '../completions';
import { PartialDiagnosticsService } from '../diagnostics/diagnostics.types';
import { PartialMetadataService } from '../metadata';
import { Services } from '../utils/services.types';

export type CEPPlugin = (
  logger: Logger,
  services: Services,
) => {
  completions?: PartialCompletionsService[];
  diagnostics?: PartialDiagnosticsService[];
  metadata?: PartialMetadataService[];
};
