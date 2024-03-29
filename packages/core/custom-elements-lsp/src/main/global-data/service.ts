import { Logger } from 'typescript-template-language-service-decorator';
import {
  GlobalAttrType,
  GlobalDataInfo,
  GlobalDataRepository,
  GlobalDataService,
  PlainElementAttribute,
} from './global-data.types';

export class GlobalDataServiceImpl implements GlobalDataService {
  constructor(
    private logger: Logger,
    private repo: GlobalDataRepository,
  ) {
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

  getHTMLElementTags(): string[] {
    return this.repo.getHTMLElementTags();
  }

  getHTMLAttributes(tagName: string): PlainElementAttribute[] {
    return this.repo.getHTMLAttributes(tagName);
  }

  getHTMLInfo(tagName: string): GlobalDataInfo | undefined {
    return this.repo.getHTMLInfo(tagName);
  }
}
