import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import {
  ThreeDSecureInterface,
  ChallengeResultInterface,
  ConfigInterface,
  MethodURLResultInterface,
} from '3ds-sdk-js';
import { IMethodUrlData } from './IMethodUrlData';
import { IChallengeData } from './IChallengeData';
import { ThreeDSecureProvider } from './three-d-secure-provider/ThreeDSecureProvider';

@Service()
export class ThreeDSecureClient {
  private threeDSecure: ThreeDSecureInterface;

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private threeDSecureProvider: ThreeDSecureProvider,
  ) {}

  init(): void {
    this.threeDSecure = this.threeDSecureProvider.getSdk();

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.THREE_D_SECURE_INIT)
      .thenRespond((event: IMessageBusEvent<ConfigInterface>) => this.init$(event.data));

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.THREE_D_SECURE_METHOD_URL)
      .thenRespond((event: IMessageBusEvent<IMethodUrlData>) => this.run3DSMethod$(event.data));

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.THREE_D_SECURE_CHALLENGE)
      .thenRespond((event: IMessageBusEvent<IChallengeData>) => this.doChallenge$(event.data));

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.THREE_D_SECURE_BROWSER_DATA)
      .thenRespond(() => of(this.threeDSecure.getBrowserData()));
  }

  private init$(config: ConfigInterface): Observable<ConfigInterface> {
    return this.threeDSecure.init$(config);
  }

  private run3DSMethod$({ methodUrl, notificationUrl, transactionId }: IMethodUrlData): Observable<MethodURLResultInterface> {
    return this.threeDSecure.run3DSMethod$(
      notificationUrl,
      transactionId,
      methodUrl,
    );
  }

  private doChallenge$(data: IChallengeData): Observable<ChallengeResultInterface> {
    return this.threeDSecure.doChallenge$(
      data.version,
      data.payload,
      data.challengeURL,
    );
  }
}
