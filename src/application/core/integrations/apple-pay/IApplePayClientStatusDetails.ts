import { ApplePayClientErrorCode } from './ApplePayClientErrorCode';
import { IApplePayConfigObject } from './apple-pay-config-service/IApplePayConfigObject';
import { IApplePayPayment } from './apple-pay-payment-data/IApplePayPayment';

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
