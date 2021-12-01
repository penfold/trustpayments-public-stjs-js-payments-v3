import { IApplePayShippingBillingContact } from '../IApplePayShippingBillingContact';
import { IApplePayPaymentPass } from './IApplePayPaymentPass';
import { ApplePayPaymentMethodType } from './ApplePayPaymentMethodType';

export interface IApplePayPaymentMethod {
  displayName: string;
  network: string;
  type: ApplePayPaymentMethodType;
  paymentPass: IApplePayPaymentPass;
  billingContact: IApplePayShippingBillingContact;
}
