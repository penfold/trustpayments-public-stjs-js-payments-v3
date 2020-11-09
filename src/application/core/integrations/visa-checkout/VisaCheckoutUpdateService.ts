import { Service } from 'typedi';
import { environment } from '../../../../environments/environment';
import { VisaButtonProps } from './VisaButtonProps';
import { IStJwt } from './IStJwt';
import { IVisaCheckout } from './IVisaCheckout';
import { IVisaInitConfig } from './IVisaInitConfig';
import { StJwt } from '../../shared/stjwt/StJwt';

@Service()
export class VisaCheckoutUpdateService {
  updateVisaInit(stJwt: IStJwt, config: IVisaInitConfig): IVisaInitConfig {
    config.paymentRequest.currencyCode = stJwt.currencyiso3a;
    config.paymentRequest.subtotal = stJwt.mainamount;
    config.paymentRequest.total = stJwt.mainamount;
    config.settings.locale = stJwt.locale;
    return config;
  }

  updateConfigObject(
    visaCheckout: IVisaCheckout,
    stJwt: StJwt,
    livestatus: 0 | 1
  ): { buttonUrl: string; sdkUrl: string; visaInit: IVisaInitConfig } {
    return {
      buttonUrl: livestatus ? environment.VISA_CHECKOUT_URLS.LIVE_BUTTON_URL : VisaButtonProps.src,
      sdkUrl: livestatus ? environment.VISA_CHECKOUT_URLS.LIVE_SDK : environment.VISA_CHECKOUT_URLS.TEST_SDK,
      visaInit: {
        apikey: visaCheckout.merchantId,
        encryptionKey: visaCheckout.encryptionKey,
        paymentRequest: {
          currencyCode: stJwt.currencyiso3a,
          subtotal: stJwt.mainamount,
          total: stJwt.mainamount,
          ...visaCheckout.paymentRequest
        },
        settings: {
          locale: stJwt.locale,
          ...visaCheckout.settings
        }
      }
    };
  }
}
