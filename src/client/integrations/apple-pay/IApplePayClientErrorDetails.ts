import { ApplePayClientErrorCode } from './ApplePayClientErrorCode';
import { IApplePayValidateMerchantEvent } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantEvent';
import { IApplePayPaymentAuthorizedEvent } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';

export interface IApplePayClientErrorDetails {
  errorCode?: ApplePayClientErrorCode;
  validateMerchantEvent?: IApplePayValidateMerchantEvent;
  config?: IApplePayConfigObject;
  errorMessage?: string;
  paymentCancelled?: boolean;
  walletverify?: object;
}
