import { IConsumerIdentityMasterCard, IIdentityLookupResponse, ISrcInitData } from '../../ISrc';

export interface IMastercardSrc {
  // TODO update this interface based on Mastercard documentation
  // if data types in parameters or returned values are different, create new types or use generic types
  // this interface should have exact same types as per Mastercard dev documentation, so mapping in MastercardSrcWrapper
  // will be easier to maintain
  // remove this comment eventually
  identityLookup(consumerIdentity: IConsumerIdentityMasterCard): Promise<IIdentityLookupResponse>;
  init(initData: ISrcInitData): Promise<void>;
}
