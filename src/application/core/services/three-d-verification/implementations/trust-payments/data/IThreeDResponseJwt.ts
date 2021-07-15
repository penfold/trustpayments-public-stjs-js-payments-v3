export interface IThreeDResponseJwt extends Record<string, unknown> {
  iss: string;
  iat: number;
  exp: number;
  jti: string;
  ConsumerSessionId: string;
  ReferenceId: string;
  aud: string;
  Payload: {
    Validated: boolean;
    Payment: {
      Type: string;
      ProcessorTransactionId: string;
      ExtendedData: {
        Amount: string;
        CAVV: string;
        CurrencyCode: string;
        ECIFlag: string;
        ThreeDSVersion: string;
        PAResStatus: string;
        SignatureVerification: string;
      };
    };
    ActionCode: string;
    ErrorNumber: number;
    ErrorDescription: string;
    CRes?: string;
    MD?: string;
    PaRes?: string;
  };
}
