import { IGooglePayAllowedPaymentMethodTypes } from './IGooglePayAllowedPaymentMethodTypes';
import { IGooglePayCardParameters } from './IGooglePayCardParameters';
import { IGooglePayPaypalParameters } from './IGooglePayPaypalParameters';

export type IGooglePayTotalPriceStatus = 'NOT_CURRENTLY_KNOWN' | 'ESTIMATED' | 'FINAL';

export type IGooglePayCheckoutOption = 'DEFAULT' | 'COMPLETE_IMMEDIATE_PURCHASE';

export type IGooglePayDisplayItemStatus = 'FINAL' | 'PENDING';

export type IGooglePayDisplayItemTypes = 'LINE_ITEM' | 'SUBTOTAL';

export type IGooglePayCallbackIntents = 'PAYMENT_AUTHORIZATION' | 'SHIPPING_ADDRESS' | 'SHIPPING_OPTION';

interface IGooglePayDisplayItem {
  label: string;
  price: string;
  status?: IGooglePayDisplayItemStatus;
  type: IGooglePayDisplayItemTypes;
}

interface IGooglePayTokenizationSpecification {
  parameters: {
    gateway: string;
    gatewayMerchantId: string;
  };
  type: string;
}

export interface IGooglePayTransactionInfo {
  checkoutOption?: IGooglePayCheckoutOption;
  countryCode: string;
  currencyCode: string;
  displayItems?: IGooglePayDisplayItem[];
  totalPrice?: string;
  totalPriceLabel?: string;
  totalPriceStatus?: IGooglePayTotalPriceStatus;
  transactionId?: string;
}

interface IGooglePayMerchantInfo {
  merchantId: string;
  merchantName?: string;
}

interface GooglePayAllowedPaymentMethods {
  parameters: IGooglePayCardParameters | IGooglePayPaypalParameters;
  tokenizationSpecification: IGooglePayTokenizationSpecification;
  type: IGooglePayAllowedPaymentMethodTypes;
}

interface GooglePayShippingAddressParameters {
  allowedCountryCodes: string[];
  phoneNumberRequired: boolean;
}

interface GooglePayShippingOptionSelection {
  description: string;
  id: string;
  label: string;
}

interface GooglePayShippingOptionParameters {
  defaultSelectedOptionId?: string;
  shippingOptions: GooglePayShippingOptionSelection;
}

export interface IGooglePayPaymentRequest {
  allowedPaymentMethods: GooglePayAllowedPaymentMethods;
  apiVersion: number;
  apiVersionMinor: number;
  callbackIntents?: IGooglePayCallbackIntents;
  emailRequired?: boolean;
  merchantInfo: IGooglePayMerchantInfo;
  shippingAddressParameters?: GooglePayShippingAddressParameters;
  shippingAddressRequired?: boolean;
  shippingOptionParameters?: GooglePayShippingOptionParameters;
  shippingOptionRequired?: boolean;
  transactionInfo: IGooglePayTransactionInfo;
}

export interface IGooglePlayIsReadyToPayRequest {
  apiVersion: number;
  apiVersionMinor: number;
  allowedPaymentMethods: GooglePayAllowedPaymentMethods;
  existingPaymentMethodRequired?: boolean;
}
