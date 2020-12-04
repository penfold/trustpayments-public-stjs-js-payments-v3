import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { VisaCheckoutButtonService } from '../visa-checkout-button-service/VisaCheckoutButtonService';
import { IVisaCheckoutUpdateConfig } from '../visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { VisaCheckoutUpdateService } from '../visa-checkout-update-service/VisaCheckoutUpdateService';
import { IVisaCheckoutSdk } from './IVisaCheckoutSdk';
import { IVisaCheckoutSdkProvider } from './IVisaCheckoutSdkProvider';
import { VisaCheckoutSdkProvider } from './VisaCheckoutSdkProvider';

@Service()
export class VisaCheckoutSdkProviderMock extends VisaCheckoutSdkProvider implements IVisaCheckoutSdkProvider {
  constructor(
    protected visaCheckoutUpdateService: VisaCheckoutUpdateService,
    protected jwtDecoder: JwtDecoder,
    protected visaCheckoutButtonService: VisaCheckoutButtonService
  ) {
    super(visaCheckoutUpdateService, jwtDecoder, visaCheckoutButtonService);
  }

  getSdk$(config: IConfig): Observable<IVisaCheckoutSdk> {
    const visaCheckoutUpdatedConfig: IVisaCheckoutUpdateConfig = super.getUpdatedConfig(config);

    this.visaCheckoutButtonService.mount(
      config.visaCheckout.placement,
      config.visaCheckout.buttonSettings,
      visaCheckoutUpdatedConfig.buttonUrl
    );

    return of({
      lib: {
        // tslint:disable-next-line:no-empty
        init: () => {},
        // tslint:disable-next-line:no-empty
        on: () => {}
      },
      updateConfig: visaCheckoutUpdatedConfig
    });
  }
}
