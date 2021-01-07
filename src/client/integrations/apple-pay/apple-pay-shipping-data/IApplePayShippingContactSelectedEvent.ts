import { IApplePayPaymentContact } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentContact';

export interface IApplePayShippingContactSelectedEvent {
  shippingContact: IApplePayPaymentContact;
}
