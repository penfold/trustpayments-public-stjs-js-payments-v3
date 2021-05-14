import { Service } from 'typedi';
import { environment } from '../../../../../environments/environment';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { VisaCheckoutButtonProps } from '../visa-checkout-button-service/VisaCheckoutButtonProps';
import { IVisaCheckoutInitConfig } from '../IVisaCheckoutInitConfig';
import { IStJwtPayload } from '../../../models/IStJwtPayload';
import { IVisaCheckoutUpdateConfig } from './IVisaCheckoutUpdateConfig';

@Service()
export class VisaCheckoutUpdateService {
  constructor(private jwtDecoder: JwtDecoder) {}

  updateVisaInit(stJwt: IStJwtPayload, config: IVisaCheckoutInitConfig): IVisaCheckoutInitConfig {
    return {
      ...config,
      paymentRequest: {
        ...config.paymentRequest,
        currencyCode: stJwt.currencyiso3a,
        subtotal: stJwt.mainamount,
        total: stJwt.mainamount,
      },
      settings: {
        ...config.settings,
        locale: stJwt.locale,
      },
    };
  }

  updateConfigObject(config: IConfig): IVisaCheckoutUpdateConfig {
    if (!config.visaCheckout) {
      throw new Error('VisaCheckout config has not been specified');
    }
    const jwtPayload: IStJwtPayload = this.jwtDecoder.decode(config.jwt).payload;

    return {
      buttonUrl: config.livestatus ? environment.VISA_CHECKOUT_URLS.LIVE_BUTTON_URL : VisaCheckoutButtonProps.src,
      sdkUrl: config.livestatus ? environment.VISA_CHECKOUT_URLS.LIVE_SDK : environment.VISA_CHECKOUT_URLS.TEST_SDK,
      merchantUrl: config.visaCheckout.merchantUrl,
      visaInitConfig: {
        apikey: config.visaCheckout.merchantId,
        encryptionKey: config.visaCheckout.encryptionKey,
        referenceCallID: config.visaCheckout.referenceCallID,
        externalProfileId: config.visaCheckout.externalProfileId,
        externalClientId: config.visaCheckout.externalClientId,
        paymentRequest: {
          currencyCode: jwtPayload.currencyiso3a,
          subtotal: jwtPayload.mainamount,
          total: jwtPayload.mainamount,
          ...config.visaCheckout.paymentRequest,
        },
        settings: {
          locale: jwtPayload.locale,
          ...config.visaCheckout.settings,
        },
      },
    };
  }
}
