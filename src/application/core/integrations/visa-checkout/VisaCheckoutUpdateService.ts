import { IConfig } from '../../../../shared/model/config/IConfig';
import { environment } from '../../../../environments/environment';
import { VisaButtonProps } from '../../models/constants/visa-checkout/VisaButtonProps';
import { Service } from 'typedi';
import { IVisaCheckout } from '../../models/visa-checkout/IVisaCheckout';
import { IStJwtObj } from '../../models/IStJwtObj';

@Service()
export class VisaCheckoutUpdateService {
  updatePaymentAndStJwt(config: IConfig, newJwt?: string): { updatedConfig: IConfig; jwt: string } {
    const updatedConfig: IConfig = config;
    updatedConfig.formId = config.formId;
    return {
      updatedConfig,
      jwt: newJwt ? newJwt : config.jwt
    };
  }

  updateInitObject(stJwt: IStJwtObj, config: IVisaCheckout): IConfig {
    const { currencyiso3a, mainamount, locale } = stJwt;
    config.paymentRequest.currencyCode = currencyiso3a;
    config.paymentRequest.subtotal = mainamount;
    config.paymentRequest.total = mainamount;
    config.settings.locale = locale;
    return config;
  }

  setInitObject(config: IConfig, stJwt: IStJwtObj): { buttonUrl: string; sdkUrl: string; visaConfig: IVisaCheckout } {
    const { livestatus, visaCheckout } = config;
    return {
      buttonUrl: livestatus ? environment.VISA_CHECKOUT_URLS.LIVE_BUTTON_URL : VisaButtonProps.src,
      sdkUrl: livestatus ? environment.VISA_CHECKOUT_URLS.LIVE_SDK : environment.VISA_CHECKOUT_URLS.TEST_SDK,
      visaConfig: {
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
