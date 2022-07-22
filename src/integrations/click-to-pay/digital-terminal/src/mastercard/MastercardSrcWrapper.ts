import { omit } from 'lodash';
import {
  ICheckoutData,
  ICheckoutResponse,
  ICompleteIdValidationResponse, IConsumerIdentity, IIdentityLookupResponse, IIsRecognizedResponse, ISrc, ISrcInitData,
  ISrcProfileList, IUnbindAppInstanceResponse,
} from '../../ISrc';
import { environment } from '../../../../../environments/environment';
import {
  IMastercardConsumerIdentity, IMastercardIdentityLookupResponse, IMastercardInitiateIdentityValidationResponse,
  IMastercardSrc,
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
    };

    return this.mastercardSrc.init({
      ...initData,
      ...mastercardInitData,
    } as ISrcInitData);

  }

  // TODO implement https://securetrading.atlassian.net/browse/STJS-3514
  checkout(data: ICheckoutData): Promise<ICheckoutResponse> {
    return Promise.resolve(undefined);
  }

  completeIdentityValidation(validationData: string): Promise<ICompleteIdValidationResponse> {
    return this.mastercardSrc.completeIdentityValidation(validationData);
  }

  // TODO implement in  https://securetrading.atlassian.net/browse/STJS-3510
  getSrcProfile(idTokens: string[]): Promise<ISrcProfileList> {
    return Promise.resolve(undefined);
  }

  identityLookup(consumerIdentity: IConsumerIdentity): Promise<IIdentityLookupResponse> {
    return this.mastercardSrc.identityLookup(this.consumerIdentityMapper(consumerIdentity)).then((identityLookupResponse: IMastercardIdentityLookupResponse) => {
      return omit(identityLookupResponse, 'lastUsedCardTimestamp');
    });
  }

  initiateIdentityValidation(requestedValidationChannelId?: string): Promise<IMastercardInitiateIdentityValidationResponse> {
    return this.mastercardSrc.initiateIdentityValidation({ requestedValidationChannelId });
  }

  isRecognized(): Promise<IIsRecognizedResponse> {
    return this.mastercardSrc.isRecognized();
  }

  unbindAppInstance(idToken?: string): Promise<IUnbindAppInstanceResponse> {
    return this.mastercardSrc.unbindAppInstance().then(({ srcCorrelationId })=>({ srcCorrelatedId: srcCorrelationId }))
  }

  private consumerIdentityMapper(consumerIdentity: IConsumerIdentity): IMastercardConsumerIdentity {
    return {
      consumerIdentity: {
        ...consumerIdentity,
        identityType: MasterCardIdentityType[consumerIdentity.type] || consumerIdentity.type,
      },
    };
  }
}
