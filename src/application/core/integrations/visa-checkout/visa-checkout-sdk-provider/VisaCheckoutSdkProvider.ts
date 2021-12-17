import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Service } from 'typedi';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { DomMethods } from '../../../shared/dom-methods/DomMethods';
import { VisaCheckoutButtonService } from '../visa-checkout-button-service/VisaCheckoutButtonService';
import { IVisaCheckoutUpdateConfig } from '../visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { SentryService } from '../../../../../shared/services/sentry/SentryService';
import { IVisaCheckoutSdk, IVisaCheckoutSdkLib } from './IVisaCheckoutSdk';
import { IVisaCheckoutSdkProvider } from './IVisaCheckoutSdkProvider';

declare const V: IVisaCheckoutSdkLib;

@Service()
export class VisaCheckoutSdkProvider implements IVisaCheckoutSdkProvider {
  private isSdkLoaded = false;

  constructor(protected visaCheckoutButtonService: VisaCheckoutButtonService, protected sentryService: SentryService) {
  }

  getSdk$(config: IConfig, visaCheckoutUpdateConfig: IVisaCheckoutUpdateConfig): Observable<IVisaCheckoutSdk> {
    if (this.isSdkLoaded) {
      return of(V);
    }

    return this.insertScript$(config, visaCheckoutUpdateConfig).pipe(
      this.sentryService.captureAndReportResourceLoadingTimeout('Visa Checkout script load timeout'),
      tap(() => {
        this.visaCheckoutButtonService.mount(
          config.visaCheckout.placement,
          config.visaCheckout.buttonSettings,
          visaCheckoutUpdateConfig.buttonUrl
        );
      }),
      switchMap(() => {
        return of(V);
      })
    );
  }

  // Needs to be public in order to mock it in unit test.
  // Should be replaced when DomMethods.insertScript is not static
  insertScript$(config: IConfig, visaCheckoutUpdatedConfig: IVisaCheckoutUpdateConfig): Observable<Element> {
    return DomMethods.insertScript(config.visaCheckout.placement, {
      src: visaCheckoutUpdatedConfig.sdkUrl,
      id: 'visaCheckout',
    });
  }
}
