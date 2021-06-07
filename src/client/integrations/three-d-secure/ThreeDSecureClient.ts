import { EMPTY, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Service } from 'typedi';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import {
  ThreeDSecureInterface,
  ChallengeResultInterface,
  ConfigInterface,
  MethodURLResultInterface,
  ThreeDSecureFactory,
  CardType,
  ResultActionCode,
} from '@trustpayments/3ds-sdk-js';
import { Translator } from '../../../application/core/shared/translator/Translator';
import { IMethodUrlData } from './IMethodUrlData';
import { IChallengeData } from './IChallengeData';

@Service()
export class ThreeDSecureClient {
  private threeDSecure: ThreeDSecureInterface;

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private threeDSecureFactory: ThreeDSecureFactory,
    private translator: Translator,
  ) {}

  init(): void {
    this.threeDSecure = this.threeDSecureFactory.create();

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

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_SHOW)
      .thenRespond((event: IMessageBusEvent<string>) => of(
        this.threeDSecure.showProcessingScreen(event.data as CardType)),
      );

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE)
      .thenRespond(() => of(this.threeDSecure.hideProcessingScreen()));
  }

  private init$(config: ConfigInterface): Observable<ConfigInterface | never> {
    if (config.translations && config.translations.cancel) {
      return this.threeDSecure.init$(config);
    }

    const updatedConfig = {
      ...config,
      translations: {
        cancel: this.translator.translate('Cancel'),
      },
    };

    return this.threeDSecure.init$(updatedConfig).pipe(
      catchError((err: any) => {
        console.error(err);

        return EMPTY;
      })
    );
  }

  private run3DSMethod$({ methodUrl, notificationUrl, transactionId }: IMethodUrlData): Observable<MethodURLResultInterface> {
    return this.threeDSecure.run3DSMethod$(
      transactionId,
      notificationUrl,
      methodUrl,
    ).pipe(
      tap((methodUrlResult: MethodURLResultInterface) => {
        console.log('WHTRBIT Method URL success', methodUrlResult);

        if (methodUrlResult.status === ResultActionCode.UNCOMPLETED) {
          console.error(`3DS transaction with uncompleted 3DS Method`);
        }
      }),
    );
  }

  private doChallenge$(data: IChallengeData): Observable<ChallengeResultInterface> {
    return this.threeDSecure.doChallenge$(
      data.version,
      data.payload,
      data.challengeURL,
      data.cardType,
    ).pipe(
      tap((challengeResult: ChallengeResultInterface) => {
        console.log('WHTRBIT Challenge success', challengeResult);

        if (challengeResult.status === ResultActionCode.UNCOMPLETED) {
          // @TODO: should throw an error or leave it go to call AUTH on Gateway?
          console.error('WHTRBIT Challenge uncompleted');
        }
      }),
    );
  }
}
