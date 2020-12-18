import { ApplePayClientErrorCode } from './ApplePayClientErrorCode';
import { IApplePayValidateMerchantEvent } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantEvent';
import { IApplePayPaymentAuthorizedEvent } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';

export interface IApplePayClientErrorDetails {
  errorCode: ApplePayClientErrorCode;
  errorEvent?: IApplePayValidateMerchantEvent | IApplePayPaymentAuthorizedEvent;
  errorMessage?: string;
}
