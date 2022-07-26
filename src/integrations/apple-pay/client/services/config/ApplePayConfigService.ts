import { Money } from 'ts-money';
import { Service } from 'typedi';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { IStJwtPayload } from '../../../../../application/core/models/IStJwtPayload';
import { Locale } from '../../../../../application/core/shared/translator/Locale';
import { ApplePayNetworksService } from '../../models/apple-pay-networks-service/ApplePayNetworksService';
import { IApplePaySessionWrapper } from '../../models/IApplePaySessionWrapper';
import { IApplePayPaymentRequest } from '../../models/apple-pay-payment-data/IApplePayPaymentRequest';
import { IApplePayValidateMerchantRequest } from '../../models/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IApplePayConfig } from '../../models/IApplePayConfig';
import { IApplePayConfigObject } from './IApplePayConfigObject';

@Service()
export class ApplePayConfigService {
  constructor(
    private jwtDecoder: JwtDecoder,
    private applePayNetworkService: ApplePayNetworksService,
    private applePaySessionWrapper: IApplePaySessionWrapper
  ) {}

  getConfig(config: IConfig, validateMerchantRequest: IApplePayValidateMerchantRequest): IApplePayConfigObject {
    const { applePay, jwt, formId, merchantUrl } = this.getConfigData(config);
    const applePayVersion: number = this.applePaySessionWrapper.getLatestSupportedApplePayVersion();
    const { currencyiso3a, locale, mainamount } = this.getStJwtData(jwt);

    return {
      applePayConfig: {
        ...applePay,
        paymentRequest: this.updatePaymentRequest(applePay, currencyiso3a, mainamount, applePayVersion),
      },
      applePayVersion,
      locale,
      formId,
      jwtFromConfig: jwt,
      merchantUrl,
      validateMerchantRequest: this.updateWalletMerchantId(validateMerchantRequest, applePay.merchantId),
      paymentRequest: this.updatePaymentRequest(applePay, currencyiso3a, mainamount, applePayVersion),
    };
  }

  updateWalletValidationUrl(
    validateMerchantRequest: IApplePayValidateMerchantRequest,
    walletvalidationurl: string
  ): IApplePayValidateMerchantRequest {
    return {
      ...validateMerchantRequest,
      walletvalidationurl,
    };
  }

  private updateCurrencyCode(paymentRequest: IApplePayPaymentRequest, currencyCode: string): IApplePayPaymentRequest {
    return {
      ...paymentRequest,
      currencyCode,
    };
  }

  private updateAmount(paymentRequest: IApplePayPaymentRequest, amount: string): IApplePayPaymentRequest {
    return {
      ...paymentRequest,
      total: {
        ...paymentRequest.total,
        amount,
      },
    };
  }

  private updateRequestTypes(paymentRequest: IApplePayPaymentRequest): IApplePayPaymentRequest {
    return {
      ...paymentRequest,
    };
  }

  private updateWalletMerchantId(
    validateMerchantRequest: IApplePayValidateMerchantRequest,
    walletmerchantid: string
  ): IApplePayValidateMerchantRequest {
    return {
      ...validateMerchantRequest,
      walletmerchantid,
    };
  }

  getStJwtData(jwt: string): { currencyiso3a: string; locale: Locale; mainamount: string } {
    const payload: IStJwtPayload = this.jwtDecoder.decode(jwt).payload;
    let mainamount = payload.mainamount;

    if (mainamount === undefined) {
      mainamount = Money.fromInteger({
        amount: parseInt(payload.baseamount, 10),
        currency: payload.currencyiso3a,
      }).toString();
    }

    return {
      currencyiso3a: payload.currencyiso3a,
      locale: payload.locale,
      mainamount,
    };
  }

  private getConfigData(config: IConfig): { applePay: IApplePayConfig; formId: string; jwt: string; merchantUrl: string } {
    return {
      applePay: config.applePay,
      formId: config.formId,
      jwt: config.jwt,
      merchantUrl: config.applePay.merchantUrl,
    };
  }

  private updatePaymentRequest(
    applePay: IApplePayConfig,
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

    return this.updateRequestTypes(paymentRequest);
  }
}
