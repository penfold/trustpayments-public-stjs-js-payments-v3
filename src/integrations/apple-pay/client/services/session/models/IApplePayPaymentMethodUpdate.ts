import { IApplePayShippingLineItem } from '../../../models/IApplePayShippingLineItem';

export interface IApplePayPaymentMethodUpdate {
  newTotal: IApplePayShippingLineItem;
  newLineItems?: IApplePayShippingLineItem[];
}
