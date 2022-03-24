import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import {
  ThreeDSecureInterface,
  ChallengeResultInterface,
  ConfigInterface,
  MethodURLResultInterface,
  ThreeDSecureFactory,
  CardType,
  ThreeDSecureVersion,
} from '@trustpayments/3ds-sdk-js';
import { switchMap, takeUntil } from 'rxjs/operators';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { Translator } from '../../../application/core/shared/translator/Translator';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { SentryBreadcrumbsCategories } from '../../../shared/services/sentry/SentryBreadcrumbsCategories';
import { IMethodUrlData } from './IMethodUrlData';
import { IChallengeData } from './IChallengeData';

@Service()
export class ThreeDSecureClient {
  private threeDSecure: ThreeDSecureInterface;
  private destroy$: Observable<IMessageBusEvent<unknown>>;

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private threeDSecureFactory: ThreeDSecureFactory,
    private translator: Translator,
    private messageBus: IMessageBus,
    private sentryService: SentryService
  ) {
    this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
  }

  init(): void {
    this.threeDSecure = this.threeDSecureFactory.create();

    this.threeDSecure.logs$.pipe(takeUntil(this.destroy$)).subscribe((log) => {
      this.sentryService.addBreadcrumb(SentryBreadcrumbsCategories.THREE_DS, log.type + ': ' + log.message);
    });

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
      .thenRespond((event: IMessageBusEvent<string[]>) => (this.threeDSecure.getBrowserData$(event.data) as unknown as Observable<unknown>));

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_SHOW)
      .thenRespond((event: IMessageBusEvent<string>) => of(
        this.threeDSecure.showProcessingScreen(event.data as CardType, 0)),
      );

    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.THREE_D_SECURE_PROCESSING_SCREEN_HIDE)
      .thenRespond(() => of(this.threeDSecure.hideProcessingScreen()));

    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.THREED_CANCEL), takeUntil(this.destroy$))
      .subscribe(() => this.cancel$());

    this.messageBus.pipe(
      ofType(PUBLIC_EVENTS.THREED_CANCEL),
      switchMap(() => this.cancel$()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private init$(config: ConfigInterface): Observable<ConfigInterface> {
    if (config.translations && config.translations.cancel) {
      return this.threeDSecure.init$(config);
    }

    const updatedConfig = {
      ...config,
      translations: {
        cancel: this.translator.translate('Cancel'),
      },
    };

    return this.threeDSecure.init$(updatedConfig)
  }

  private run3DSMethod$({
                          methodUrl,
                          notificationUrl,
                          transactionId,
                        }: IMethodUrlData): Observable<MethodURLResultInterface> {
    return this.threeDSecure.run3DSMethod$(
      transactionId,
      notificationUrl,
      methodUrl,
    );
  }

  private doChallenge$(data: IChallengeData): Observable<ChallengeResultInterface> {
    return this.threeDSecure.doChallenge$(
      new ThreeDSecureVersion(data.version),
      data.payload,
      data.challengeURL,
      data.cardType,
      data.termURL,
      data.merchantData,
    );
  }

  private cancel$(): Observable<ChallengeResultInterface> {
    return this.threeDSecure.cancelChallenge$();
  }
}
