import { Service } from 'typedi';
import { environment } from '../../../../../environments/environment';
import { VisaCheckoutButtonProps } from '../visa-checkout-button-service/VisaCheckoutButtonProps';
import { IVisaCheckoutConfig } from '../IVisaCheckoutConfig';
import { IVisaCheckoutInitConfig } from '../IVisaCheckoutInitConfig';
import { IStJwtPayload } from '../../../models/IStJwtPayload';

@Service()
export class VisaCheckoutUpdateService {
  updateVisaInit(stJwt: IStJwtPayload, config: IVisaCheckoutInitConfig): IVisaCheckoutInitConfig {
    return {
      ...config,
      paymentRequest: {
        ...config.paymentRequest,
        currencyCode: stJwt.currencyiso3a,
        subtotal: stJwt.mainamount,
        total: stJwt.mainamount
      },
      settings: {
        ...config.settings,
        locale: stJwt.locale
      }
    };
  }

  updateConfigObject(
    visaCheckout: IVisaCheckoutConfig,
    stJwt: IStJwtPayload,
    livestatus: 0 | 1
  ): { buttonUrl: string; sdkUrl: string; visaInit: IVisaCheckoutInitConfig } {
    return {
      buttonUrl: livestatus ? environment.VISA_CHECKOUT_URLS.LIVE_BUTTON_URL : VisaCheckoutButtonProps.src,
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
