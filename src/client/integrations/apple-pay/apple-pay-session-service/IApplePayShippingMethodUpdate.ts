import { IApplePayShippingLineItem } from '../apple-pay-shipping-data/IApplePayShippingLineItem';

export interface IApplePayShippingMethodUpdate {
  newTotal: IApplePayShippingLineItem;
  newLineItems?: IApplePayShippingLineItem[];
}
