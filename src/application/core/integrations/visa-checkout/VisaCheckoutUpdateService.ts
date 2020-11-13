import { Service } from 'typedi';
import { environment } from '../../../../environments/environment';
import { VisaButtonProps } from './VisaButtonProps';
import { IVisaCheckoutConfig } from './IVisaCheckoutConfig';
import { IVisaInitConfig } from './IVisaInitConfig';
import { StJwt } from '../../shared/stjwt/StJwt';

@Service()
export class VisaCheckoutUpdateService {
  updateVisaInit(stJwt: StJwt, config: IVisaInitConfig): IVisaInitConfig {
    const modifiedConfig: IVisaInitConfig = { ...config };
    modifiedConfig.paymentRequest.currencyCode = stJwt.currencyiso3a;
    modifiedConfig.paymentRequest.subtotal = stJwt.mainamount;
    modifiedConfig.paymentRequest.total = stJwt.mainamount;
    modifiedConfig.settings.locale = stJwt.locale;
    return modifiedConfig;
  }

  updateConfigObject(
    visaCheckout: IVisaCheckoutConfig,
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
