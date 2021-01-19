import { IApplePayError } from '../../../../application/core/integrations/apple-pay/apple-pay-error-service/IApplePayError';
import { IApplePayShippingMethod } from '../apple-pay-shipping-data/IApplePayShippingMethod';
import { IApplePayShippingLineItem } from '../apple-pay-shipping-data/IApplePayShippingLineItem';

export interface IApplePayShippingContactUpdate {
  newTotal: IApplePayShippingLineItem;
  newLineItems?: IApplePayShippingLineItem[];
  errors?: IApplePayError[];
  newShippingMethods?: IApplePayShippingMethod[];
}
