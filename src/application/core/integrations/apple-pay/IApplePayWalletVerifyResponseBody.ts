export interface IApplePayWalletVerifyResponseBody {
  customeroutput: string;
  errorcode: string;
  errormesage: string;
  requestid: string;
  requesttypedescription: string;
  transactionstartedtimestamp: string;
  walletsession: string;
  walletsource: 'APPLEPAY';
}
