import { IApplePayPaymentAuthorizationResult } from './IApplePayPaymentAuthorizationResult';
import { IApplePayPaymentAuthorizedEvent } from './IApplePayPaymentAuthorizedEvent';
import { IApplePayValidateMerchantEvent } from './IApplePayValidateMerchantEvent';

export interface IApplePaySession {
  oncancel: (event: Event) => void;
  onpaymentauthorized: (event: IApplePayPaymentAuthorizedEvent) => void;
  onvalidatemerchant: (event: IApplePayValidateMerchantEvent) => void;

  abort(): void;
  begin(): void;

  completeMerchantValidation(merchantSession: unknown): void;
  completePayment(status: IApplePayPaymentAuthorizationResult): void;
}
