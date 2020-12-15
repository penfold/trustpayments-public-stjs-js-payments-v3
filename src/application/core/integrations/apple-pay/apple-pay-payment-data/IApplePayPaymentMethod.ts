import { IApplePayBillingContact } from './IApplePayBillingContact';
import { IApplePayPaymentPass } from './IApplePayPaymentPass';
import { ApplePaymentMethodType } from './ApplePaymentMethodType';

export interface IApplePayPaymentMethod {
  displayName: string;
  network: string;
  type: ApplePaymentMethodType;
  paymentPass: IApplePayPaymentPass;
  billingContact: IApplePayBillingContact;
}
