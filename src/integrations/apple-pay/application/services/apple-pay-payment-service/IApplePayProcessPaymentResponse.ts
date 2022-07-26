import { IRequestTypeResponse } from '../../../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';

export interface IApplePayProcessPaymentResponse extends IRequestTypeResponse {
  accounttypedescription?: string;
  acquirerresponsecode: string;
  authcode: string;
  baseamount: string;
  cavv: string;
  currencyiso3a: string;
  customeroutput?: string;
  dccenabled: string;
  eci: string;
  errorcode: string;
  errormessage: string;
  livestatus: string;
  maskedpan: string;
  merchantcountryiso2a: string;
  merchantname: string;
  merchantnumber: string;
  operatorname: string;
  paymenttypedescription: string;
  requesttypedescription?: string;
  securityresponseaddress: string;
  securityresponsepostcode: string;
  securityresponsesecuritycode: string;
  settleduedate: string;
  settlestatus: string;
  splitfinalnumber: string;
  tid: string;
  tokenisedpayment: string;
  tokentype: string;
  transactionreference: string;
  transactionstartedtimestamp: string;
  walletdisplayname: string;
  walletsource: string;
}
