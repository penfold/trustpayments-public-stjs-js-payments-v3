export interface IDecodedJwt {
  iat?: number;
  iss?: string;
  payload: {
    accounttypedescription: string;
    baseamount: string;
    bypassCards: string[];
    currencyiso3a: string;
    expirydate: string;
    locale: string;
    mainamount: string;
    pan: string;
    securitycode: string;
    sitereference: string;
    requestTypes: string[];
  };
}
