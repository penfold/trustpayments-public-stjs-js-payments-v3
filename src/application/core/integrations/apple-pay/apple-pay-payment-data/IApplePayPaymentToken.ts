import { IApplePayPaymentMethod } from './IApplePayPaymentMethod';

export interface IApplePayPaymentToken {
  paymentMethod: IApplePayPaymentMethod;
  transactionIdentifier: string;
  paymentData: string;
}
