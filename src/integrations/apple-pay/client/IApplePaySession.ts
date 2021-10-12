import { IApplePayPaymentAuthorizationResult } from './interfaces/IApplePayPaymentAuthorizationResult';
import { IApplePayPaymentAuthorizedEvent } from './interfaces/IApplePayPaymentAuthorizedEvent';
import { IApplePayValidateMerchantEvent } from './interfaces/IApplePayValidateMerchantEvent';

export interface IApplePaySession {
  oncancel: (event: Event) => void;
  onpaymentauthorized: (event: IApplePayPaymentAuthorizedEvent) => void;
  onvalidatemerchant: (event: IApplePayValidateMerchantEvent) => void;

  abort(): void;
  begin(): void;

  completeMerchantValidation(merchantSession: unknown): void;
  completePayment(status: IApplePayPaymentAuthorizationResult): void;
}
