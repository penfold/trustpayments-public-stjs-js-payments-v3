import { IApplePayError } from '../apple-pay-error-service/IApplePayError';

export interface IApplePayPaymentAuthorizationResult {
  status: number | undefined;
  errors: IApplePayError | undefined;
}
