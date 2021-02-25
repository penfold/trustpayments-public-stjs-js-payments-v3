export interface IApplePayWalletVerifyResponseBody {
  customeroutput: string;
  errorcode: string;
  errormessage: string;
  requestid: string;
  requesttypedescription: string;
  transactionstartedtimestamp: string;
  walletsession: string;
  walletsource: 'APPLEPAY';
}
