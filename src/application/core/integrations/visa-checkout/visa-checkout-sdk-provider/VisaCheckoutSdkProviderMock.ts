import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { VisaCheckoutButtonService } from '../visa-checkout-button-service/VisaCheckoutButtonService';
import { IVisaCheckoutUpdateConfig } from '../visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { IVisaCheckoutSdk } from './IVisaCheckoutSdk';
import { IVisaCheckoutSdkProvider } from './IVisaCheckoutSdkProvider';
import { VisaCheckoutSdkProvider } from './VisaCheckoutSdkProvider';

@Service()
export class VisaCheckoutSdkProviderMock extends VisaCheckoutSdkProvider implements IVisaCheckoutSdkProvider {
  constructor(protected visaCheckoutButtonService: VisaCheckoutButtonService) {
    super(visaCheckoutButtonService);
  }

  getSdk$(config: IConfig, visaCheckoutUpdateConfig: IVisaCheckoutUpdateConfig): Observable<IVisaCheckoutSdk> {
    this.visaCheckoutButtonService.mount(
      config.visaCheckout.placement,
      config.visaCheckout.buttonSettings,
      visaCheckoutUpdateConfig.buttonUrl
    );

    return of({
      init: () => {},
      on: () => {},
    });
  }
}
