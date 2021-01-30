import { IApplePayPaymentAuthorizationResult } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizationResult ';
import { IApplePayPaymentAuthorizedEvent } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';
import { IApplePayPaymentMethodSelectedEvent } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentMethodSelectedEvent';
import { IApplePayShippingContactSelectedEvent } from '../apple-pay-shipping-data/IApplePayShippingContactSelectedEvent';
import { IApplePayShippingMethodSelectedEvent } from '../apple-pay-shipping-data/IApplePayShippingMethodSelectedEvent';
import { IApplePayValidateMerchantEvent } from '../../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantEvent';
import { IApplePayPaymentMethodUpdate } from './IApplePayPaymentMethodUpdate';
import { IApplePayShippingContactUpdate } from './IApplePayShippingContactUpdate';
import { IApplePayShippingMethodUpdate } from './IApplePayShippingMethodUpdate';

export interface IApplePaySession {
  oncancel: (event: Event) => void;

  onpaymentauthorized: (event: IApplePayPaymentAuthorizedEvent) => void;

  onpaymentmethodselected: (event: IApplePayPaymentMethodSelectedEvent) => void;

  onshippingcontactselected: (event: IApplePayShippingContactSelectedEvent) => void;

  onshippingmethodselected: (event: IApplePayShippingMethodSelectedEvent) => void;

  onvalidatemerchant: (event: IApplePayValidateMerchantEvent) => void;

  openPaymentSetup(merchantId: string): Promise<boolean>;

  abort(): void;

  begin(): void;

  completeMerchantValidation(merchantSession: any): void;

  completePayment(status: IApplePayPaymentAuthorizationResult): void;

  completePaymentMethodSelection(update: IApplePayPaymentMethodUpdate): void;

  completeShippingContactSelection(update: IApplePayShippingContactUpdate): void;

  completeShippingMethodSelection(update: IApplePayShippingMethodUpdate): void;
}
