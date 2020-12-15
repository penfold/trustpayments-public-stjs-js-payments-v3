import { IApplePayLineItem } from '../apple-pay-payment-data/IApplePayLineItem';

export interface IApplePayPaymentMethodUpdate {
  newTotal: IApplePayLineItem;
  newLineItems?: IApplePayLineItem[];
}
