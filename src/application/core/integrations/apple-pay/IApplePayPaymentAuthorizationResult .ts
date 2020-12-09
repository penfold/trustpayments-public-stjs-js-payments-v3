import { IApplePayError } from './apple-pay-error-service/IApplePayError';

export interface IApplePayPaymentAuthorizationResult {
  status: string;
  errors: IApplePayError;
}
