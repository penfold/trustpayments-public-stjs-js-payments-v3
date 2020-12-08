export interface IVisaCheckoutStatusDataInitRequest {
  allowCustomBranding: boolean;
  allowEnrollment: boolean;
  apikey: string;
  backgroundImageId: string;
  browserLocale: string;
  clientId: string;
  currencyFormat: string;
  displayName: string;
  enableUserDataPrefill: boolean;
  encryptionKey: string;
  guestCheckout: boolean;
  parentUrl: string;
  paymentRequest: {
    currencyCode: string;
    subtotal: string;
    total: string;
  };
  settings: {
    buttonPosition: string;
    displayName: string;
    locale: string;
    payment: object;
    shipping: {
      collectShipping: string;
    };
    widgetStyle: string;
  };
}
