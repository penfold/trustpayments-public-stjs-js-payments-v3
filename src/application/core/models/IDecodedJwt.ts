export interface IDecodedJwt {
  iat?: number;
  iss?: string;
  payload: {
    parenttransactionreference?: string;
    accounttypedescription: string;
    baseamount: string;
    currencyiso3a: string;
    locale: string;
    mainamount: string;
    pan: string;
    expirydate: string;
    securitycode: string;
    sitereference: string;
  };
}
