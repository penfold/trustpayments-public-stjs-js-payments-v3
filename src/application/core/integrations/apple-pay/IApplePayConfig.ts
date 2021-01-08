import { IApplePayPaymentRequest } from './apple-pay-payment-data/IApplePayPaymentRequest';

export interface IApplePayConfig {
  buttonStyle: string;
  buttonText: string;
  merchantId: string;
  paymentRequest: IApplePayPaymentRequest;
  placement: string;
}
