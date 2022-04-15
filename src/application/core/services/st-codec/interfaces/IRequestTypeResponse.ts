export interface IRequestTypeResponse {
  [key: string]: string | unknown;
  customeroutput?: string;
  errorcode?: string;
  errordata?: string[] |  unknown ;
  errormessage?: string;
  requesttypedescription?: string;
  transactionstartedtimestamp?: string;
}
