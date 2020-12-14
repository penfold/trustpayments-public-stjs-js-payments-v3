import { IApplePayConfig } from '../IApplePayConfig';
import { Locale } from '../../../shared/translator/Locale';
import { IApplePayValidateMerchantRequest } from '../IApplePayValidateMerchantRequest';
import { IApplePayPaymentRequest } from '../IApplePayPaymentRequest';

export interface IApplePayConfigObject {
  applePayConfig: IApplePayConfig;
  applePayVersion: number;
  locale: Locale;
  formId: string;
  jwtFromConfig: string;
  validateMerchantRequest: IApplePayValidateMerchantRequest;
  paymentRequest: IApplePayPaymentRequest;
}
