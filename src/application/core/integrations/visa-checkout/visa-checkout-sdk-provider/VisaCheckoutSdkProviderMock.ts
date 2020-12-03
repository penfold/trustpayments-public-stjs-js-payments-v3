import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { IStJwtPayload } from '../../../models/IStJwtPayload';
import { DomMethods } from '../../../shared/dom-methods/DomMethods';
import { VisaCheckoutButtonProps } from '../visa-checkout-button-service/VisaCheckoutButtonProps';
import { VisaCheckoutButtonService } from '../visa-checkout-button-service/VisaCheckoutButtonService';
import { IVisaCheckoutUpdateConfig } from '../visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { VisaCheckoutUpdateService } from '../visa-checkout-update-service/VisaCheckoutUpdateService';
import { IVisaCheckoutSdk } from './IVisaCheckoutSdk';
import { IVisaCheckoutSdkProvider } from './IVisaCheckoutSdkProvider';

@Service()
export class VisaCheckoutSdkProviderMock implements IVisaCheckoutSdkProvider {
  constructor(
    private visaCheckoutUpdateService: VisaCheckoutUpdateService,
    private jwtDecoder: JwtDecoder,
    private visaCheckoutButtonService: VisaCheckoutButtonService
  ) {}

  addButtonClickEventListener(): void {
    DomMethods.addListener(VisaCheckoutButtonProps.id, 'click', () => {
      console.log('CLICK');
    });
  }

  getSdk$(config: IConfig): Observable<IVisaCheckoutSdk> {
    const visaCheckoutUpdatedConfig: IVisaCheckoutUpdateConfig = this.getUpdatedConfig(config);

    this.visaCheckoutButtonService.customize(config.visaCheckout.buttonSettings, visaCheckoutUpdatedConfig.buttonUrl);
    this.visaCheckoutButtonService.mount(
      config.visaCheckout.placement,
      config.visaCheckout.buttonSettings,
      visaCheckoutUpdatedConfig.buttonUrl
    );

    this.addButtonClickEventListener();

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

  getUpdatedConfig(config: IConfig): IVisaCheckoutUpdateConfig {
    const jwtPayload: IStJwtPayload = this.jwtDecoder.decode(config.jwt).payload;

    return this.visaCheckoutUpdateService.updateConfigObject(config.visaCheckout, jwtPayload, config.livestatus);
  }
}
