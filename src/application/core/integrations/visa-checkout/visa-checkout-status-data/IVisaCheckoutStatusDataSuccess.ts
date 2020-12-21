import { IVisaCheckoutStatusDataInitRequest } from './IVisaCheckoutStatusDataInitRequest';

export interface IVisaCheckoutStatusDataSuccess {
  callid: string | null;
  encKey: string;
  encPaymentData: string;
  idToken: string;
  partialPaymentInstrument: {
    lastFourDigits: string;
    paymentType: {
      cardBrand: string;
      cardType: string;
    };
  };
  partialShippingAddress: {
    countryCode: string;
    postalCode: string;
  };
  paymentMethodType: string;
  unbindAppInstance: boolean;
  vInitRequest: IVisaCheckoutStatusDataInitRequest;
}
