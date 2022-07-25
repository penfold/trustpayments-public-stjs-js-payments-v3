import {
  ICheckoutData,
  ICheckoutResponse,
  ICompleteIdValidationResponse, IConsumerIdentity,
  IIdentityLookupResponse, IInitiateIdentityValidationResponse, IIsRecognizedResponse,
  ISrc, ISrcInitData, ISrcProfileList, IUnbindAppInstanceResponse,
} from '../../ISrc';
import { environment } from '../../../../../environments/environment';
import { IVisaSrc } from './IVisaSrc';

export class VisaSrcWrapper implements ISrc {
  private visaSrc: IVisaSrc;

  constructor() {
    //@ts-ignore
    const vSrcAdapter = window.vAdapters.VisaSRCI;
    this.visaSrc = new vSrcAdapter();
  }

  checkout(data: ICheckoutData): Promise<ICheckoutResponse> {
    return this.visaSrc.checkout(data);
  }

  completeIdentityValidation(validationData: string): Promise<ICompleteIdValidationResponse> {
    return this.visaSrc.completeIdentityValidation(validationData);
  }

  getSrcProfile(idTokens: string[]): Promise<ISrcProfileList> {
    return this.visaSrc.getSrcProfile(idTokens);
  }

  identityLookup(consumerIdentity: IConsumerIdentity): Promise<IIdentityLookupResponse> {
    return this.visaSrc.identityLookup(consumerIdentity);
  }

  init(initData: ISrcInitData | Partial<ISrcInitData>): Promise<void> {
    const visaInitData: Partial<ISrcInitData> = {
      srcInitiatorId: environment.CLICK_TO_PAY.VISA.SRC_INITIATOR_ID,
      srciDpaId: environment.CLICK_TO_PAY.VISA.DPA_ID,
    };
    return this.visaSrc.init({
      ...initData,
      ...visaInitData,
    } as ISrcInitData);
  }

  initiateIdentityValidation(): Promise<IInitiateIdentityValidationResponse> {
    return this.visaSrc.initiateIdentityValidation();
  }

  isRecognized(): Promise<IIsRecognizedResponse> {
    return this.visaSrc.isRecognized();
  }

  unbindAppInstance(idToken?: string): Promise<IUnbindAppInstanceResponse> {
    return this.visaSrc.unbindAppInstance(idToken);
  }
}
