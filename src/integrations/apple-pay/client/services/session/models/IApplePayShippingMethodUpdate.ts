import { IApplePayShippingLineItem } from '../../../models/IApplePayShippingLineItem';

export interface IApplePayShippingMethodUpdate {
  newTotal: IApplePayShippingLineItem;
  newLineItems?: IApplePayShippingLineItem[];
}
