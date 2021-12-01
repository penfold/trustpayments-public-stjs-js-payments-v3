import { Locale } from '../../../../../application/core/shared/translator/Locale';
import { IApplePayValidateMerchantRequest } from '../../models/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IApplePayConfig } from '../../models/IApplePayConfig';
import { IApplePayPaymentRequest } from '../../models/IApplePayPaymentRequest';

export interface IApplePayConfigObject {
  applePayConfig: IApplePayConfig;
  applePayVersion: number;
  locale: Locale;
  formId: string;
  jwtFromConfig: string;
  merchantUrl?: string;
  validateMerchantRequest: IApplePayValidateMerchantRequest;
  paymentRequest: IApplePayPaymentRequest;
}
