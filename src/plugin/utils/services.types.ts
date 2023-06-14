import { CustomElementsService } from '../custom-elements/custom-elements.types';
import { GlobalDataService } from '../global-data/global-data.types';
import { IOService } from './io';

export type Services = {
  customElements: CustomElementsService;
  globalData: GlobalDataService;
  io: IOService;
};
