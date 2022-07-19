import {
  ICheckoutData,
  ICheckoutResponse,
  ICompleteIdValidationResponse, IConsumerIdentity,
  IIdentityLookupResponse, IInitiateIdentityValidationResponse, IIsRecognizedResponse,
  ISrc, ISrcInitData, ISrcProfileList, IUnbindAppInstanceResponse,
} from '../../ISrc';
import { environment } from '../../../../../environments/environment';
import { IMastercardSrc } from './IMastercardSrc';

export class MastercardSrcWrapper implements ISrc {
  private mastercardSrc: IMastercardSrc;

  constructor() {
    //@ts-ignore
    this.mastercardSrc =  new window.SRCSDK_MASTERCARD();
  }

  init(initData: ISrcInitData | Partial<ISrcInitData>): Promise<void> {
    const visaInitData: Partial<ISrcInitData> = {
      srcInitiatorId: environment.CLICK_TO_PAY.VISA.SRC_INITIATOR_ID,
    };
    //@ts-ignore

    return this.mastercardSrc.init({
      ...initData,
      ...visaInitData,
    } as ISrcInitData);

  }

  // TODO implement https://securetrading.atlassian.net/browse/STJS-3514
  checkout(data: ICheckoutData): Promise<ICheckoutResponse> {
    return Promise.resolve(undefined);
  }

  // TODO implement in https://securetrading.atlassian.net/browse/STJS-3513
  completeIdentityValidation(validationData: string): Promise<ICompleteIdValidationResponse> {
    return Promise.resolve(undefined);
  }

  // TODO implement in  https://securetrading.atlassian.net/browse/STJS-3510
  getSrcProfile(idTokens: string[]): Promise<ISrcProfileList> {
    return Promise.resolve(undefined);
  }

  // TODO implement in https://securetrading.atlassian.net/browse/STJS-3511
  identityLookup(consumerIdentity: IConsumerIdentity): Promise<IIdentityLookupResponse> {
    // TODO this is mocked so CTP is still working
    return Promise.resolve({
      consumerPresent: false,
    });
  }

  // TODO implement in https://securetrading.atlassian.net/browse/STJS-3512
  initiateIdentityValidation(): Promise<IInitiateIdentityValidationResponse> {
    return Promise.resolve(undefined);
  }

  // TODO implement in https://securetrading.atlassian.net/browse/STJS-3509
  isRecognized(): Promise<IIsRecognizedResponse> {
    // TODO this is mocked so CTP is still working
    return Promise.resolve({
      recognized: false,
      idTokens: [],
    });
  }

  unbindAppInstance(idToken?: string): Promise<IUnbindAppInstanceResponse> {
    return this.mastercardSrc.unbindAppInstance().then(({ srcCorrelationId })=>({ srcCorrelatedId: srcCorrelationId }))
  }
}
