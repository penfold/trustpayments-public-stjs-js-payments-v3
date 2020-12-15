import { IApplePayConfig } from '../IApplePayConfig';
import { Locale } from '../../../shared/translator/Locale';
import { IApplePayValidateMerchantRequest } from '../apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IApplePayPaymentRequest } from '../apple-pay-payment-data/IApplePayPaymentRequest';

export interface IApplePayConfigObject {
  applePayConfig: IApplePayConfig;
  applePayVersion: number;
  locale: Locale;
  formId: string;
  jwtFromConfig: string;
  validateMerchantRequest: IApplePayValidateMerchantRequest;
  paymentRequest: IApplePayPaymentRequest;
}
