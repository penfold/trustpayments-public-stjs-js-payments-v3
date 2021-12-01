import { IApplePayProcessPaymentResponse } from './IApplePayProcessPaymentResponse';

export interface IApplePayProcessPaymentData {
  jwt: string;
  response: IApplePayProcessPaymentResponse;
}
