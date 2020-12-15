import { ApplePayPaymentPassActivationState } from './ApplePayPaymentPassActivationState';

export interface IApplePayPaymentPass {
  primaryAccountIdentifier: string;
  primaryAccountNumberSuffix: string;
  activationState: ApplePayPaymentPassActivationState;
  deviceAccountIdentifier?: string;
  deviceAccountNumberSuffix?: string;
}
