import { IApplePayPaymentRequest } from './IApplePayPaymentRequest';
import { IApplePayRequestTypes } from './IApplePayRequestTypes';

export interface IApplePay {
  buttonStyle: string;
  buttonText: string;
  merchantId: string;
  paymentRequest: IApplePayPaymentRequest;
  placement: string;
  requestTypes?: IApplePayRequestTypes[];
}
