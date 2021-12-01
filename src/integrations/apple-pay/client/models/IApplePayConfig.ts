import { IApplePayPaymentRequest } from './apple-pay-payment-data/IApplePayPaymentRequest';

export interface IApplePayConfig {
  buttonStyle: 'black' | 'white' | 'white-outline';
  buttonText: 'plain' | 'buy' | 'book' | 'donate' | 'check-out' | 'subscribe';
  buttonPlacement?: string;
  merchantId: string;
  merchantUrl?: string;
  paymentRequest: IApplePayPaymentRequest;
  placement?: string;
}
