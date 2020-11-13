import { RequestType } from '../../../shared/types/RequestType';
import { BypassCards } from './constants/BypassCards';

export interface IStJwtPayload {
  requesttypedescriptions?: RequestType[];
  baseamount?: number;
  mainamount?: number;
  accounttypedescription?: string;
  currencyiso3a?: string;
  sitereference?: string;
  threedbypasscards?: BypassCards[];
  parenttransactionreference?: string;
  locale?: string;
  pan?: string;
  expirydate?: string;
  securitycode?: string;
}
