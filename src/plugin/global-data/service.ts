import { Logger } from "typescript-template-language-service-decorator";
import { GlobalDataRepository, GlobalDataService } from "./global-data.types";

export class GlobalDataServiceImpl implements GlobalDataService {
  constructor(private logger: Logger, private repo: GlobalDataRepository) {
    this.logger.log("Setting up GlobalDataServiceImpl");
  }

  getAttributes(): string[] {
    return this.repo.getAttributes();
  }
}
