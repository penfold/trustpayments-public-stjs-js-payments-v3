import { GooglePayShippingOptionSelection, IGooglePayDisplayItem } from './IGooglePayPaymentRequest';

export enum GoogleDynamicPriceUpdates {
  INITIALIZE = 'INITIALIZE',
  SHIPPING_ADDRESS = 'SHIPPING_ADDRESS',
  SHIPPING_OPTION = 'SHIPPING_OPTION',
  PAYMENT_AUTHORIZATION = 'PAYMENT_AUTHORIZATION',
}

export interface IntermediatePaymentData {
  callbackTrigger: GoogleDynamicPriceUpdates;
}

export interface INewShippingOptionParameters {
  newShippingOptionParameters?: {
    defaultSelectedOptionId?: string;
    shippingOptions?: GooglePayShippingOptionSelection[];
  };
  newTransactionInfo?: {
    displayItems?: IGooglePayDisplayItem[];
  } | Record<string, never>;
}