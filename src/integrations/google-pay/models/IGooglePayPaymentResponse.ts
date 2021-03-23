import { IGooglePayAllowedPaymentMethodTypes } from './IGooglePayAllowedPaymentMethodTypes';
import { IGooglePaySupportedNetworks } from './IGooglePayCardParameters';

interface IGooglePayResponseAddress {
  name?: string;
  postalcode?: string;
  countryCode?: string;
  phoneNumber?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  locality?: string;
  administrativeArea?: string;
  sortingCode?: string;
}

interface IGooglePayAssuranceDetails {
  accountVerified: boolean;
  cardHolderAuthenticated: boolean;
}

interface IGooglePayCardInfo {
  cardDetails: string;
  assuranceDetails: IGooglePayAssuranceDetails;
  cardNetwork: IGooglePaySupportedNetworks;
  billingAddress?: IGooglePayResponseAddress;
}

interface IGooglePayPaymentMethodTokenizationData {
  type: string;
  token: string;
}

interface IGooglePayPaymentMethodData {
  type: IGooglePayAllowedPaymentMethodTypes;
  description: string;
  info: IGooglePayCardInfo;
  tokenizationData: IGooglePayPaymentMethodTokenizationData;
}

export interface IGooglePayPaymentResponse {
  apiVersion: number;
  apiVersionMinor: number;
  paymentMethodData: IGooglePayPaymentMethodData;
  email?: string;
  shippingAddress?: IGooglePayResponseAddress;
}
