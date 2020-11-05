export interface IDecodedJwt {
  iat?: number;
  iss?: string;
  payload: {
    accounttypedescription: string;
    baseamount: string;
    currencyiso3a: string;
    expirydate: string;
    locale: string;
    mainamount: string;
    pan: string;
    requesttypedescriptions: string[];
    securitycode: string;
    sitereference: string;
    threedbypasscards: string[];
  };
}
