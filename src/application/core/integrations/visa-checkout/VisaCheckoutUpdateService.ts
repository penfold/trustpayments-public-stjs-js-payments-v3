import { Service } from 'typedi';
import { environment } from '../../../../environments/environment';
import { VisaButtonProps } from './VisaButtonProps';
import { IVisaCheckoutConfig } from './IVisaCheckoutConfig';
import { IVisaInitConfig } from './IVisaInitConfig';
import { IStJwtPayload } from '../../models/IStJwtPayload';
import { IVisaSettings } from './IVisaSettings';
import { IVisaPaymentRequest } from './IVisaPaymentRequest';

@Service()
export class VisaCheckoutUpdateService {
  updateVisaInit(stJwt: IStJwtPayload, config: IVisaInitConfig): IVisaInitConfig {
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
