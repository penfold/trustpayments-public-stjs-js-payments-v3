export interface IApplePayPaymentPass {
  primaryAccountIdentifier: string;
  primaryAccountNumberSuffix: string;
  activationState: 'activated' | 'requiresActivation' | 'activating' | 'suspended' | 'deactivated';
  deviceAccountIdentifier?: string;
  deviceAccountNumberSuffix?: string;
}
