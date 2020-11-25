import { RequestType } from '../../../shared/types/RequestType';

export interface IStJwtPayload {
  requesttypedescriptions?: RequestType[];
  baseamount?: string;
  mainamount?: number;
  accounttypedescription?: string;
  currencyiso3a?: string;
  sitereference?: string;
  threedbypasspaymenttypes?: string[];
  parenttransactionreference?: string;
  locale?: string;
  pan?: string;
  expirydate?: string;
  securitycode?: string;
  subscriptiontype?: string;
  subscriptionunit?: string;
  subscriptionfrequency?: string;
  subscriptionnumber?: string;
  subscriptionfinalnumber?: string;
  subscriptionbegindate?: string;
  credentialsonfile?: string;
}
