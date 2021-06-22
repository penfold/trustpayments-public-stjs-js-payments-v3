import { IGooglePayCardParameters } from './IGooglePayCardParameters';
import { IGooglePayPaypalParameters } from './IGooglePayPaypalParameters';

type IGooglePayTotalPriceStatus = 'NOT_CURRENTLY_KNOWN' | 'ESTIMATED' | 'FINAL';

type IGooglePayCheckoutOption = 'DEFAULT' | 'COMPLETE_IMMEDIATE_PURCHASE';

type IGooglePayDisplayItemStatus = 'FINAL' | 'PENDING';

type IGooglePayDisplayItemTypes = 'LINE_ITEM' | 'SUBTOTAL';

type IGooglePayAllowedPaymentMethodTypes = 'CARD' | 'PAYPAL';

type IGooglePayCallbackIntents = 'PAYMENT_AUTHORIZATION' | 'SHIPPING_ADDRESS' | 'SHIPPING_OPTION';

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

interface IGooglePayTransactionInfo {
  checkoutOption?: IGooglePayCheckoutOption;
  countryCode: string;
  currencyCode: string;
  displayItems?: IGooglePayDisplayItem[];
  totalPriceLabel?: string;
  totalPriceStatus?: IGooglePayTotalPriceStatus;
  transactionId?: string;
}

export interface IGooglePayMerchantInfo {
  merchantId: string;
  merchantName?: string;
  merchantOrigin?: string;
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
  environment: 'TEST' | 'PRODUCTION';
  merchantInfo: IGooglePayMerchantInfo;
  shippingAddressParameters?: GooglePayShippingAddressParameters;
  shippingAddressRequired?: boolean;
  shippingOptionParameters?: GooglePayShippingOptionParameters;
  shippingOptionRequired?: boolean;
  transactionInfo: IGooglePayTransactionInfo;
}
