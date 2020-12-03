import { from, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Service } from 'typedi';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { IStJwtPayload } from '../../../models/IStJwtPayload';
import { DomMethods } from '../../../shared/dom-methods/DomMethods';
import { VisaCheckoutButtonService } from '../visa-checkout-button-service/VisaCheckoutButtonService';
import { IVisaCheckoutUpdateConfig } from '../visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { VisaCheckoutUpdateService } from '../visa-checkout-update-service/VisaCheckoutUpdateService';
import { IVisaCheckoutSdk } from './IVisaCheckoutSdk';
import { IVisaCheckoutSdkProvider } from './IVisaCheckoutSdkProvider';

declare const V: any;

@Service()
export class VisaCheckoutSdkProvider implements IVisaCheckoutSdkProvider {
  private isSdkLoaded: boolean = false;

  constructor(
    private visaCheckoutUpdateService: VisaCheckoutUpdateService,
    private jwtDecoder: JwtDecoder,
    private visaCheckoutButtonService: VisaCheckoutButtonService
  ) {}

  getSdk$(config: IConfig): Observable<IVisaCheckoutSdk> {
    const visaCheckoutUpdatedConfig: IVisaCheckoutUpdateConfig = this.getUpdatedConfig(config);

    if (this.isSdkLoaded) {
      return of({
        lib: null,
        updateConfig: visaCheckoutUpdatedConfig
      });
    } else {
      return from(
        DomMethods.insertScript(config.visaCheckout.placement, {
          src: visaCheckoutUpdatedConfig.sdkUrl,
          id: 'visaCheckout'
        })
      ).pipe(
        tap(() => {
          this.visaCheckoutButtonService.customize(
            config.visaCheckout.buttonSettings,
            visaCheckoutUpdatedConfig.buttonUrl
          );
          this.visaCheckoutButtonService.mount(
            config.visaCheckout.placement,
            config.visaCheckout.buttonSettings,
            visaCheckoutUpdatedConfig.buttonUrl
          );
        }),
        switchMap(() => {
          return of({
            lib: V,
            updateConfig: visaCheckoutUpdatedConfig
          });
        })
      );
    }
  }

  getUpdatedConfig(config: IConfig): IVisaCheckoutUpdateConfig {
    const jwtPayload: IStJwtPayload = this.jwtDecoder.decode(config.jwt).payload;

    return this.visaCheckoutUpdateService.updateConfigObject(config.visaCheckout, jwtPayload, config.livestatus);
  }
}
