import {
  ICompleteIdValidationResponse,
  IIdentityLookupResponse,
  IInitiateIdentityValidationResponse,
  IIsRecognizedResponse, IMaskedAddress, IMaskedCard,
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
  identityProvider?: string;
  identityValue: string;
  identityType: MasterCardIdentityType;
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

export interface IMastercardUnbindAppInstanceResponse {
  srcCorrelationId: string;
}

export interface IMastercardSrcProfile {
  maskedConsumer?: IMastercardMaskedConsumer;
  maskedCards: IMaskedCard[];
  maskedShippingAddresses: IMaskedAddress[];
  authorization: string;
}

export interface IMastercardMaskedConsumer {
  srcConsumerId: string;
  maskedConsumerIdentity: IMastercardConsumerIdentity;
  maskedEmailAddress: string;
  maskedMobileNumber: {
    countryCode: string,
    maskedPhoneNumber: string
  };
  maskedNationalIdentifier: string;
  complianceSettings: {
    communications: {
      communicationsOptIn: boolean
    },
    cookie: {
      acceptedVersion: string,
      latestVersion: string,
      latestVersionUri: string,
    },
    privacy: {
      acceptedVersion: string,
      latestVersion: string,
      latestVersionUri: string,
    },
    tnc: {
      acceptedVersion: string,
      latestVersion: string,
      latestVersionUri: string,
    }
  },
  countryCode: string;
  languageCode: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED',
  maskedFirstName: string;
  maskedLastName: string;
  maskedFullName: string;
  dateConsumerAdded: number;
  dateConsumerLastUsed: number;
}

export interface IMastercardSrcProfileList {
  scrCorrelationId: string;
  profiles: IMastercardSrcProfile[];
}

export interface IMastercardSrc {
  // TODO update this interface based on Mastercard documentation
  // if data types in parameters or returned values are different, create new types or use generic types
  // this interface should have exact same types as per Mastercard dev documentation, so mapping in MastercardSrcWrapper
  // will be easier to maintain
  // remove this comment eventually
  completeIdentityValidation(validationData: string): Promise<ICompleteIdValidationResponse>;

  getSrcProfile(data?: { idTokens: string[] }): Promise<IMastercardSrcProfileList>;

  initiateIdentityValidation(): Promise<IMastercardInitiateIdentityValidationResponse>;

  identityLookup({ consumerIdentity: IMastercardConsumerIdentity }): Promise<IMastercardIdentityLookupResponse>;

  init(initData: ISrcInitData): Promise<void>;

  isRecognized(): Promise<IIsRecognizedResponse>;

  unbindAppInstance(idToken?: string): Promise<IMastercardUnbindAppInstanceResponse>;

}
