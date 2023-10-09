import { CustomElementsService } from '../custom-elements/custom-elements.types';
import { GlobalDataService } from '../global-data/global-data.types';
import { IOService } from './io';

export type Services = {
  customElements: CustomElementsService;
  globalData: GlobalDataService;
  io: IOService;
  /**
   * Returns true if all services are ready, having completed any async background tasks.
   * @remarks Because we have to do async setup for some services, but we can't use await as the plugin expects a synchronous setup function.
   */
  servicesReady: () => boolean;
};
