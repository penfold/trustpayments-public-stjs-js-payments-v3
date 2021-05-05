import { Observable, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
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
} from '3ds-sdk-js';
import { GatewayClient } from '../../../application/core/services/GatewayClient';
import { IThreeDSchemaLookupResponse } from '../../../application/core/models/IThreeDSchemaLookupResponse';

@Service()
export class ThreeDSecureClient {
  private threeDSecure: ThreeDSecureInterface;
  private schemaLookup: IThreeDSchemaLookupResponse;

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private gatewayClient: GatewayClient,
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

  private trigger$(pan: string): Observable<IThreeDSecure3dsMethod> {
    return this.gatewayClient.schemaLookup(pan).pipe(
      first(),
      switchMap((response: IThreeDSchemaLookupResponse) => {
        this.schemaLookup = response;

        return of({
          methodUrl: response.methodurl,
          notificationUrl: response.notificationurl,
          threeDSTransactionId: response.threedstransactionid,
        });
      }),
    );
  }

  private start$(jwt: string): Observable<any> {
    return this.threeDSecure.run3DSMethod$(
      this.schemaLookup.notificationurl,
      this.schemaLookup.threedstransactionid,
      this.schemaLookup.methodurl,
    );
  }

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
      map((challengeResult: ChallengeResultInterface) => ({
        validated: true,
        actionCode: ActionCode.SUCCESS,
        errorNumber: 0,
        errorDescription: 'Success',
      })),
    );
  }
}
