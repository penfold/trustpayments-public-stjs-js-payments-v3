import { IApplePayShippingLineItem } from '../apple-pay-shipping-data/IApplePayShippingLineItem';

export interface IApplePayPaymentMethodUpdate {
  newTotal: IApplePayShippingLineItem;
  newLineItems?: IApplePayShippingLineItem[];
}
