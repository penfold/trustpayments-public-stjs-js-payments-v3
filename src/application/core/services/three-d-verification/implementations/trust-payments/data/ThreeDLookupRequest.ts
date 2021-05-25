import { IStRequest } from '../../../../../models/IStRequest';

export class ThreeDLookupRequest implements IStRequest {
  readonly requesttypedescriptions = ['THREEDLOOKUP'];

  constructor(
    public expirydate: string, 
    public pan: string, 
    public securitycode: string,
  ) {}
}
