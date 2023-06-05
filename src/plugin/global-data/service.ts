import { Logger } from 'typescript-template-language-service-decorator';
import { GlobalAttrType, GlobalDataRepository, GlobalDataService } from './global-data.types';

export class GlobalDataServiceImpl implements GlobalDataService {
  constructor(private logger: Logger, private repo: GlobalDataRepository) {
    this.logger.log('Setting up GlobalDataServiceImpl');
  }

  getAttributes(): [string, GlobalAttrType][] {
    return this.repo.getAttributes();
  }

  getAriaAttributes(): string[] {
    return this.repo.getAriaAttributes();
  }

  getEvents(): string[] {
    return this.repo.getEvents();
  }
}
