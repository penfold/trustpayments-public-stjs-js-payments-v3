import { IApplePayError } from './IApplePayError';

export interface IApplePayPaymentAuthorizationResult {
  status: number | undefined;
  errors?: IApplePayError[] | undefined;
}
