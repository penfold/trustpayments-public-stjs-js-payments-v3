import { IApplePayError } from '../../../models/IApplePayError';
import { IApplePayShippingLineItem } from '../../../models/IApplePayShippingLineItem';
import { IApplePayShippingMethod } from '../../../models/IApplePayShippingMethod';

export interface IApplePayShippingContactUpdate {
  newTotal: IApplePayShippingLineItem;
  newLineItems?: IApplePayShippingLineItem[];
  errors?: IApplePayError[];
  newShippingMethods?: IApplePayShippingMethod[];
}
