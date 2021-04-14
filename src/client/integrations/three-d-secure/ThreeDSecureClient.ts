import { EMPTY, Observable } from 'rxjs';
import { Service } from 'typedi';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import {
  ThreeDSecureFactory,
  ConfigInterface,
  ThreeDSecureInterface,
  ChallengeDisplayMode,
  ThreeDSecureVersion,
  // @ts-ignore
} from '3ds-sdk-js';

@Service()
export class ThreeDSecureClient {
  private threeDSecure: ThreeDSecureInterface;

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private messageBus: IMessageBus,
  ) {
    const threeDSecureFactory = new ThreeDSecureFactory();

    this.threeDSecure = threeDSecureFactory.create();
  }

  init(): void {
    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.THREE_D_SECURE_SETUP)
      .thenRespond(() => this.setup$());

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.THREE_D_SECURE_TRIGGER)
      .thenRespond(() => this.trigger$());

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.THREE_D_SECURE_START)
      .thenRespond(() => this.start$());

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.THREE_D_SECURE_VERIFY)
      .thenRespond(() => this.verify$());
  }

  private setup$(): Observable<ConfigInterface> {
    // @ts-ignore
    return this.threeDSecure.init$({
      challengeDisplayMode: ChallengeDisplayMode.POPUP,
    });
  }

  private start$(): Observable<any> {
    // @ts-ignore
    return this.threeDSecure.run3DSMethod$(
      '2af781fd-c5f6-486a-ada1-adc9320bd54f',
      'mockNotificationURL',
      'http://localhost:8887/three_ds_method',
    );
  }

  private verify$(): Observable<any> {
    const creq = {
      messageType: 'CReq',
      messageVersion: ThreeDSecureVersion.v2_2,
      threeDSServerTransID: '364581ed-d5f6-486b-ada1-adc9320bd55d',
      acsTransID: 'acsTransId',
      challengeWindowSize: '02',
    };

    // @ts-ignore
    return this.threeDSecure.doChallenge$(
      ThreeDSecureVersion.v2_2,
      btoa(JSON.stringify(creq)),
      'http://localhost:8887/v2/three_ds_challenge',
    );
  }

  private trigger$(): Observable<void> {
    return EMPTY;
  }
}
