import { IRequestTypeResponse } from '../../../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';

export interface IApplePayWalletVerifyResponseBody extends IRequestTypeResponse {
  jwt: string;
  customeroutput: string;
  errorcode: string;
  errormessage: string;
  requestid: string;
  requesttypedescription: string;
  transactionstartedtimestamp: string;
  walletsession: string;
  walletsource: 'APPLEPAY';
}
