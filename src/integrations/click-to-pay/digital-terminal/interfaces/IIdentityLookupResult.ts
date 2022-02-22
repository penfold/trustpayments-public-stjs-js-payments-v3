import { SrcName } from '../SrcName';

export interface IIdentityLookupResult {
  consumerPresent: boolean;
  srcNames: SrcName[];
}
