import { RequestType } from '../../../shared/types/RequestType';
import { Locale } from '../shared/translator/Locale';

export interface IStJwtPayload {
  requesttypedescriptions?: RequestType[];
  baseamount?: string;
  mainamount?: string;
  accounttypedescription?: string;
  currencyiso3a?: string;
  sitereference?: string;
  threedbypasspaymenttypes?: string[];
  parenttransactionreference?: string;
  locale?: Locale;
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
  billingcountryiso2a?: string;
  customercountryiso2a?: string;
}
