import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Service } from 'typedi';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { ActionCode } from '../../../application/core/services/three-d-verification/data/ActionCode';
import { IVerificationData } from '../../../application/core/services/three-d-verification/data/IVerificationData';
import { IVerificationResult } from '../../../application/core/services/three-d-verification/data/IVerificationResult';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { IThreeDSecure3dsMethod } from './IThreeDSecure3dsMethod';
import {
  ThreeDSecureFactory,
  ThreeDSecureInterface,
  ThreeDSecureVersion,
  ChallengeResultInterface,
  ConfigInterface,
  ResultActionCode,
} from '3ds-sdk-js';

@Service()
export class ThreeDSecureClient {
  private threeDSecure: ThreeDSecureInterface;

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private configProvider: ConfigProvider,
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
      .thenRespond((event: IMessageBusEvent<string>) => this.trigger$(event.data));

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.THREE_D_SECURE_START)
      .thenRespond((event: IMessageBusEvent<string>) => this.start$(event.data));

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.THREE_D_SECURE_VERIFY)
      .thenRespond((event: IMessageBusEvent<IVerificationData>) => this.verify$(event.data));
  }

  private setup$(): Observable<ConfigInterface> {
    return this.configProvider.getConfig$().pipe(
      switchMap((config: IConfig) => {
        return this.threeDSecure.init$(config.threeDSecure);
      }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private trigger$(pan: string): Observable<IThreeDSecure3dsMethod> {
    return of({
      methodUrl: 'http://localhost:8887/three_ds_method',
      notificationUrl: 'mockNotificationURL',
      threeDSTransactionId: '2af781fd-c5f6-486a-ada1-adc9320bd54f', // SUCCESS
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private start$(jwt: string): Observable<any> {
    return this.threeDSecure.run3DSMethod$(
      '2af781fd-c5f6-486a-ada1-adc9320bd54f',
      'mockNotificationURL',
      'http://localhost:8887/three_ds_method',
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private verify$(verificationData: IVerificationData): Observable<IVerificationResult> {
    const creq = {
      messageType: 'CReq',
      messageVersion: ThreeDSecureVersion.v2_2,
      threeDSServerTransID: '364581ed-d5f6-486b-ada1-adc9320bd55d',
      acsTransID: 'acsTransId',
      challengeWindowSize: '02',
    };

    return this.threeDSecure.doChallenge$(
      ThreeDSecureVersion.v2_2,
      btoa(JSON.stringify(creq)),
      'http://localhost:8887/v2/three_ds_challenge',
    ).pipe(
      map((challengeResult: ChallengeResultInterface) => {
        console.log('WHTRBIT', challengeResult);

        if (challengeResult.status === ResultActionCode.CANCELLED) {
          return {
            actionCode: ActionCode.CANCELLED,
            errorNumber: 0,
            errorDescription: 'xxxxxxxxxx 3DS cancel',
          };
        }

        return {
          actionCode: ActionCode.SUCCESS,
          errorNumber: 0,
          errorDescription: 'xxxxxxxxx 3DS success',
        }
      }),
    );
  }
}
