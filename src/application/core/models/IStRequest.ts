import { RequestType } from "../../../shared/types/RequestType";

export interface IStRequest {
  requestTypes?: RequestType[];
  requesttypedescription?: string;
  requesttypedescriptions?: string[];
  expirydate?: string;
  pan?: string;
  securitycode?: string;
  termurl?: string;
  fraudcontroltransactionid?: string;
  cachetoken?: string;
  threedresponse?: string;
  walletsource?: string;
  wallettoken?: string;
}
