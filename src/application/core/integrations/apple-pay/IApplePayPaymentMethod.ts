import { IApplePayBillingContact } from './IApplePayBillingContact';

export interface IApplePayPaymentMethod {
  displayName: string;
  network: string;
  type: 'debit' | 'credit' | 'prepaid' | 'store';
  paymentPass: {
    primaryAccountIdentifier: string;
    primaryAccountNumberSuffix: string;
    deviceAccountIdentifier?: string;
    deviceAccountNumberSuffix?: string;
    activationState: 'activated' | 'requiresActivation' | 'activating' | 'suspended' | 'deactivated';
  };
  billingContact: IApplePayBillingContact;
}
