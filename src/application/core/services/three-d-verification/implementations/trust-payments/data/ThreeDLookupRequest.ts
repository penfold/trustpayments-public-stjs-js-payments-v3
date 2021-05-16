import { IStRequest } from '../../../../../models/IStRequest';

export class ThreeDSchemaLookupRequest implements IStRequest {
  readonly requesttypedescriptions = ['SCHEMALOOKUP'];

  constructor(public pan: string) {}
}
