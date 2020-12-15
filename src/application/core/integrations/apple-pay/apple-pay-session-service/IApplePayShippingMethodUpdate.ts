import { IApplePayLineItem } from '../apple-pay-payment-data/IApplePayLineItem';

export interface IApplePayShippingMethodUpdate {
  newTotal: IApplePayLineItem;
  newLineItems?: IApplePayLineItem[];
}
