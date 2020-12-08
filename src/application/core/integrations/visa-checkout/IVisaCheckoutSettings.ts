import { IVisaCardBrands } from './IVisaCardBrands';

export interface IVisaCheckoutSettings {
  locale?: string;
  countryCode?: string;
  displayName?: string;
  websiteUrl?: string;
  customerSupportUrl?: string;
  enableUserDataPrefill?: boolean;
  shipping?: {
    acceptedRegions?: string[];
    collectShipping?: 'true' | 'false';
  };
  payment?: {
    cardBrands?: IVisaCardBrands[];
    acceptCanadianVisaDebit?: 'true' | 'false';
    billingCountries?: string[];
  };
  review?: {
    message?: string;
    buttonAction?: string;
  };
  threeDSSetup?: {
    threeDSActive?: 'true' | 'false';
    threeDSSuppressChallenge?: 'true' | 'false';
  };
  dataLevel?: string;
}
