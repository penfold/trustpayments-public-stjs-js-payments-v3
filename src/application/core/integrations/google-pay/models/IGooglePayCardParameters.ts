type IGooglePayAllowedCardAuthMethods = 'PAN_ONLY' | 'CRYPTOGRAM_3DS';

type IGooglePaySupportedNetworks = 'AMEX' | 'DISCOVER' | 'INTERAC' | 'JCB' | 'MASTERCARD' | 'VISA';

type IGooglePayBillingAddressParametersFormats = 'MIN' | 'FULL';

interface IGooglePayBillingAddressParameters {
  format?: IGooglePayBillingAddressParametersFormats;
  phoneNumberRequired?: boolean;
}

export interface IGooglePayCardParameters {
  allowPrepaidCards?: boolean;
  alloweCreditCards?: boolean;
  allowedCardAuthMethods: IGooglePayAllowedCardAuthMethods[];
  allowedCardNetworks: IGooglePaySupportedNetworks[];
  assuranceDetailsRequired?: boolean;
  billingAddressParameters?: IGooglePayBillingAddressParameters;
  billingAddressRequired?: boolean;
}
