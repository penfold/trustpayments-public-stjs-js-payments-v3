import {
  IIsRecognizedResponse,
  ICompleteIdValidationResponse, IIdentityLookupResponse,
  IInitiateIdentityValidationResponse,
  ISrcInitData,
} from '../../ISrc';

export enum MasterCardIdentityType {
  EMAIL = 'EMAIL_ADDRESS',
  MOBILE_NUMBER = 'MOBILE_PHONE_NUMBER',
}

export interface IMastercardIdentityLookupResponse extends IIdentityLookupResponse {
  lastUsedCardTimestamp?: string;
}

export interface IMastercardConsumerIdentity {
  consumerIdentity: {
    identityProvider?: string;
    identityValue: string;
    identityType: MasterCardIdentityType;
  };
}

export interface IMastercardIdentityValidationChannel {
  validationChannelID?: string;
  identityProvider?: string;
  identityType: MasterCardIdentityType;
  maskedValidationChannel: string;
}

export interface IMastercardInitiateIdentityValidationResponse extends IInitiateIdentityValidationResponse {
  validationMessage?: string;
  supportedValidationChannels: IMastercardIdentityValidationChannel[];
}

export interface IMastercardSrc {
  // TODO update this interface based on Mastercard documentation
  // if data types in parameters or returned values are different, create new types or use generic types
  // this interface should have exact same types as per Mastercard dev documentation, so mapping in MastercardSrcWrapper
  // will be easier to maintain
  // remove this comment eventually
  completeIdentityValidation(validationData: string): Promise<ICompleteIdValidationResponse>;

  initiateIdentityValidation(): Promise<IMastercardInitiateIdentityValidationResponse>;

  identityLookup(consumerIdentity: IMastercardConsumerIdentity): Promise<IMastercardIdentityLookupResponse>;

  init(initData: ISrcInitData): Promise<void>;

  isRecognized(): Promise<IIsRecognizedResponse>;
}
