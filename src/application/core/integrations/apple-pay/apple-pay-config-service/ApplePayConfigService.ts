import { Service } from 'typedi';
import { IApplePayPaymentRequest } from '../IApplePayPaymentRequest';
import { IApplePayValidateMerchantRequest } from '../IApplePayValidateMerchantRequest';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { RequestType } from '../../../../../shared/types/RequestType';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { IStJwtPayload } from '../../../models/IStJwtPayload';
import { IApplePayConfig } from '../IApplePayConfig';
import { ApplePayNetworksService } from '../apple-pay-networks-service/ApplePayNetworksService';
import { IDecodedJwt } from '../../../models/IDecodedJwt';
import JwtDecode from 'jwt-decode';
import { Locale } from '../../../shared/translator/Locale';
import { Money } from 'ts-money';
import { ApplePaySessionService } from '../apple-pay-session-service/ApplePaySessionService';

@Service()
export class ApplePayConfigService {
  constructor(
    private jwtDecoder: JwtDecoder,
    private applePayNetworkService: ApplePayNetworksService,
    private applePaySessionService: ApplePaySessionService
  ) {}

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

  getStJwtData(jwt: string): { currencyiso3a: string; locale: Locale; mainamount: string } {
    const payload: IStJwtPayload = this.jwtDecoder.decode(jwt).payload;
    const mainamount = Money.fromInteger({
      amount: parseInt(payload.baseamount, 10),
      currency: payload.currencyiso3a
    }).toString();
    console.error(mainamount);

    return {
      currencyiso3a: payload.currencyiso3a,
      locale: payload.locale,
      mainamount
    };
  }

  getConfigData(config: IConfig): { applePay: IApplePayConfig; formId: string; jwt: string } {
    return {
      applePay: config.applePay,
      formId: config.formId,
      jwt: config.jwt
    };
  }

  updatePaymentRequest(
    applePay: IApplePayConfig,
    jwt: string,
    currencyiso3a: string,
    mainamount: string,
    applePayVersion: number
  ): IApplePayPaymentRequest {
    let paymentRequest: IApplePayPaymentRequest = applePay.paymentRequest;
    paymentRequest.supportedNetworks = this.applePayNetworkService.setSupportedNetworks(
      applePayVersion,
      paymentRequest.supportedNetworks
    );
    paymentRequest = this.updateAmount(paymentRequest, mainamount);
    paymentRequest = this.updateCurrencyCode(paymentRequest, currencyiso3a);
    return this.updateRequestTypes(paymentRequest, JwtDecode<IDecodedJwt>(jwt).payload.requesttypedescriptions);
  }

  setConfig(config: IConfig, validateMerchantRequest: IApplePayValidateMerchantRequest) {
    const { applePay, jwt, formId } = this.getConfigData(config);
    const applePayVersion: number = this.applePaySessionService.getLatestSupportedApplePayVersion();
    const { currencyiso3a, locale, mainamount } = this.getStJwtData(jwt);
    return {
      applePayConfig: applePay,
      applePayVersion,
      locale,
      formId,
      jwtFromConfig: jwt,
      validateMerchantRequest: this.updateWalletMerchantId(validateMerchantRequest, applePay.merchantId),
      paymentRequest: this.updatePaymentRequest(applePay, jwt, currencyiso3a, mainamount, applePayVersion)
    };
  }
}
