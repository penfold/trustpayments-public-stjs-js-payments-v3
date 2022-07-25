import { omit } from 'lodash';
import {
  ICheckoutData,
  ICheckoutResponse,
  ICompleteIdValidationResponse,
  IConsumerIdentity,
  IIdentityLookupResponse,
  IInitiateIdentityValidationResponse,
  IIsRecognizedResponse,
  ISrc,
  ISrcInitData,
  ISrcProfile,
  ISrcProfileList,
  IUnbindAppInstanceResponse,
} from '../../ISrc';
import { environment } from '../../../../../environments/environment';

import {
  IMastercardConsumerIdentity,
  IMastercardIdentityLookupResponse,
  IMastercardInitiateIdentityValidationResponse,
  IMastercardSrc,
  IMastercardSrcProfile,
  MasterCardIdentityType,
} from './IMastercardSrc';

export class MastercardSrcWrapper implements ISrc {
  private mastercardSrc: IMastercardSrc;

  constructor() {
    //@ts-ignore
    this.mastercardSrc = new window.SRCSDK_MASTERCARD();
  }

  init(initData: ISrcInitData | Partial<ISrcInitData>): Promise<void> {
    const mastercardInitData: Partial<ISrcInitData> = {
      srcInitiatorId: environment.CLICK_TO_PAY.MASTERCARD.SRC_INITIATOR_ID,
      srciDpaId: environment.CLICK_TO_PAY.MASTERCARD.DPA_ID,
    };

    return this.mastercardSrc.init({
      ...initData,
      ...mastercardInitData,
    } as ISrcInitData);

  }

  checkout(data: ICheckoutData): Promise<ICheckoutResponse> {
    return this.mastercardSrc.checkout(data);
  }

  completeIdentityValidation(validationData: string): Promise<ICompleteIdValidationResponse> {
    return this.mastercardSrc.completeIdentityValidation({ validationData });
  }

  getSrcProfile(idTokens: string[]): Promise<ISrcProfileList> {
    const srcResponse = idTokens ? this.mastercardSrc.getSrcProfile({ idTokens }) : this.mastercardSrc.getSrcProfile();

    return srcResponse.then((response) => {
      return {
        profiles: response.profiles.map(profile => this.mapSrcProfile(profile)),
        srcCorrelationId: response.scrCorrelationId,
      };
    });
  }

  identityLookup(consumerIdentity: IConsumerIdentity): Promise<IIdentityLookupResponse> {
    return this.mastercardSrc.identityLookup({ consumerIdentity: this.consumerIdentityMapper(consumerIdentity) }).then((identityLookupResponse: IMastercardIdentityLookupResponse) => {
      return omit(identityLookupResponse, 'lastUsedCardTimestamp');
    });
  }

  initiateIdentityValidation(): Promise<IInitiateIdentityValidationResponse> {
    return this.mastercardSrc.initiateIdentityValidation().then((initiateIdentityValidation: IMastercardInitiateIdentityValidationResponse) => {
      return omit(initiateIdentityValidation, ['validationMessage', 'supportedValidationChannels']);
    });
  }

  isRecognized(): Promise<IIsRecognizedResponse> {
    return this.mastercardSrc.isRecognized();
  }

  unbindAppInstance(idToken?: string): Promise<IUnbindAppInstanceResponse> {
    return this.mastercardSrc.unbindAppInstance().then(({ srcCorrelationId }) => ({ srcCorrelatedId: srcCorrelationId }));
  }

  private consumerIdentityMapper(consumerIdentity: IConsumerIdentity): IMastercardConsumerIdentity {
    return {
      ...consumerIdentity,
      identityType: MasterCardIdentityType[consumerIdentity.type],
    };

  }

  private mapSrcProfile(profile: IMastercardSrcProfile): ISrcProfile {
    return {
      idToken: profile.authorization,
      maskedCards: profile.maskedCards,
      maskedConsumer: {
        emailAddress: profile.maskedConsumer.maskedEmailAddress,
        languageCode: profile.maskedConsumer.languageCode,
        fullName: profile.maskedConsumer.maskedFullName,
        lastName: profile.maskedConsumer.maskedLastName,
        firstName: profile.maskedConsumer.maskedFirstName,
        countryCode: profile.maskedConsumer.countryCode,
        mobileNumber: {
          countryCode: profile.maskedConsumer.maskedMobileNumber?.countryCode,
          phoneNumber: profile.maskedConsumer.maskedMobileNumber?.maskedPhoneNumber,
        },
      },
    };

  }
}
