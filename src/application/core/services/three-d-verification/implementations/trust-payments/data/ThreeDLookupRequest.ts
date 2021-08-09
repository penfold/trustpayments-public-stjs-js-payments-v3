import { IStRequest } from '../../../../../models/IStRequest';

export class ThreeDLookupRequest implements IStRequest {
  readonly requesttypedescriptions = ['THREEDLOOKUP'];

  readonly pan?: string;
  readonly expirydate?: string;
  readonly securitycode?: string;
  readonly walletsource?: string;
  readonly wallettoken?: string;

  constructor(params: Partial<ThreeDLookupRequest>) {
    Object.assign(this, params);
  }
}
