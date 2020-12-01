import { Service } from 'typedi';
import { StJwt } from '../../../shared/stjwt/StJwt';
import { IApplePayPaymentRequest } from '../IApplePayPaymentRequest';
import { IApplePayValidateMerchantRequest } from '../IApplePayValidateMerchantRequest';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { IApplePay } from '../IApplePay';
import { RequestType } from '../../../../../shared/types/RequestType';
import { ApplePayNetworksService } from '../apple-pay-networks-service/ApplePayNetworksService';
import jwt_decode from 'jwt-decode';
import { IDecodedJwt } from '../../../models/IDecodedJwt';

@Service()
export class ApplePayConfigService {
  constructor(private _applePayNetworkService: ApplePayNetworksService) {}

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
    const { currencyiso3a, locale, mainamount } = new StJwt(jwt);
    return {
      currencyiso3a,
      locale,
      mainamount
    };
  }

  getConfigData(config: IConfig): { applePay: IApplePay; formId: string; jwt: string } {
    return {
      applePay: config.applePay,
      formId: config.formId,
      jwt: config.jwt
    };
  }

  updatePaymentRequest(
    applePay: IApplePay,
    jwt: string,
    currencyiso3a: string,
    mainamount: string,
    applePayVersion: number
  ): IApplePayPaymentRequest {
    let paymentRequest: IApplePayPaymentRequest = applePay.paymentRequest;
    paymentRequest.supportedNetworks = this._applePayNetworkService.setSupportedNetworks(
      applePayVersion,
      paymentRequest.supportedNetworks
    );
    paymentRequest = this.updateAmount(paymentRequest, mainamount);
    paymentRequest = this.updateCurrencyCode(paymentRequest, currencyiso3a);
    return this.updateRequestTypes(paymentRequest, jwt_decode<IDecodedJwt>(jwt).payload.requesttypedescriptions);
  }
}
