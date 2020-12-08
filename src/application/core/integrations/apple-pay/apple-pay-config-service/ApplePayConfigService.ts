import { Service } from 'typedi';
import { IApplePayPaymentRequest } from '../IApplePayPaymentRequest';
import { IApplePayValidateMerchantRequest } from '../IApplePayValidateMerchantRequest';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { RequestType } from '../../../../../shared/types/RequestType';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { IStJwtPayload } from '../../../models/IStJwtPayload';
import { IApplePayConfig } from '../IApplePayConfig';

@Service()
export class ApplePayConfigService {
  constructor(private jwtDecoder: JwtDecoder) {}

  updateCurrencyCode(paymentRequest: IApplePayPaymentRequest, currencyCode: string): IApplePayPaymentRequest {
    return {
      ...paymentRequest,
      currencyCode
    };
  }

  updateAmount(paymentRequest: IApplePayPaymentRequest, amount: string): IApplePayPaymentRequest {
    return {
      ...paymentRequest,
      total: {
        ...paymentRequest.total,
        amount
      }
    };
  }

  updateRequestTypes(paymentRequest: IApplePayPaymentRequest, requestTypes: RequestType[]): IApplePayPaymentRequest {
    return {
      ...paymentRequest,
      requestTypes
    };
  }

  updateWalletMerchantId(
    validateMerchantRequest: IApplePayValidateMerchantRequest,
    walletmerchantid: string
  ): IApplePayValidateMerchantRequest {
    return {
      ...validateMerchantRequest,
      walletmerchantid
    };
  }

  updateWalletValidationUrl(
    validateMerchantRequest: IApplePayValidateMerchantRequest,
    walletvalidationurl: string
  ): IApplePayValidateMerchantRequest {
    return {
      ...validateMerchantRequest,
      walletvalidationurl
    };
  }

  getStJwtData(jwt: string): { currencyiso3a: string; locale: string; mainamount: string } {
    const payload: IStJwtPayload = this.jwtDecoder.decode(jwt).payload;

    return {
      currencyiso3a: payload.currencyiso3a,
      locale: payload.locale,
      mainamount: payload.mainamount
    };
  }

  getConfigData(config: IConfig): { applePay: IApplePayConfig; formId: string; jwt: string } {
    return {
      applePay: config.applePay,
      formId: config.formId,
      jwt: config.jwt
    };
  }
}
