import { IApplePayError } from '../apple-pay-error-service/IApplePayError';
import { IApplePayShippingMethod } from '../apple-pay-payment-data/IApplePayShippingMethod';
import { IApplePayLineItem } from '../apple-pay-payment-data/IApplePayLineItem';

export interface IApplePayShippingContactUpdate {
  newTotal: IApplePayLineItem;
  newLineItems?: IApplePayLineItem[];
  errors?: IApplePayError[];
  newShippingMethods?: IApplePayShippingMethod[];
}
