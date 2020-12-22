import { ApplePayClientErrorCode } from './ApplePayClientErrorCode';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { IApplePayPayment } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPayment';

export interface IApplePayClientStatusDetails {
  config?: IApplePayConfigObject;
  errorCode?: ApplePayClientErrorCode;
  errorMessage?: string;
  formData?: object;
  payment?: IApplePayPayment;
  paymentCancelled?: boolean;
  validateMerchantURL?: string;
  walletverify?: object;
}
