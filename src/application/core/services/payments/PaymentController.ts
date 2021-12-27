import { ContainerInstance, Service } from 'typedi';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, first, map, mapTo, mergeMap, switchMap, takeUntil, tap } from 'rxjs/operators';
import { PaymentMethodToken } from '../../../dependency-injection/InjectionTokens';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { Debug } from '../../../../shared/Debug';
import { EventScope } from '../../models/constants/EventScope';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { GoogleAnalytics } from '../../integrations/google-analytics/GoogleAnalytics';
import { EventType } from '../../integrations/google-analytics/events';
import { IPaymentMethod } from './IPaymentMethod';
import { IInitPaymentMethod } from './events/IInitPaymentMethod';
import { IStartPaymentMethod } from './events/IStartPaymentMethod';
import { IPaymentResult } from './IPaymentResult';
import { PaymentResultHandler } from './PaymentResultHandler';
import { ErrorResultFactory } from './ErrorResultFactory';
import { PaymentError } from './error/PaymentError';

@Service()
export class PaymentController {
  private paymentMethods: Map<string, IPaymentMethod> = new Map();
  private destroy$: Observable<void>;

  constructor(
    private container: ContainerInstance,
    private messageBus: IMessageBus,
    private paymentResultHandler: PaymentResultHandler,
    private errorResultFactory: ErrorResultFactory,
    private sentryService: SentryService,
    private googleAnalytics: GoogleAnalytics,
  ) {
    this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
  }

  init(): void {
    const paymentMethods: IPaymentMethod[] = this.container.getMany(PaymentMethodToken);

    paymentMethods.forEach(paymentMethod => this.paymentMethods.set(paymentMethod.getName(), paymentMethod));

    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.INIT_PAYMENT_METHOD),
        map((event: IMessageBusEvent<IInitPaymentMethod<unknown>>) => event.data),
        mergeMap(({ name, config }: IInitPaymentMethod<unknown>) =>
          of(true).pipe(
            tap(() => {
              this.messageBus.publish({
                type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_STARTED,
                data: { name },
              }, EventScope.EXPOSED);
            }),
            switchMap(() => this.getPaymentMethod(name).init(config)),
            mapTo(name),
            catchError((error: Error) => {
              Debug.error(`Payment method initialization failed: ${name}`, error);
              this.sentryService.sendCustomMessage(
                PaymentError.duringInit('Payment method initialization failed', name, error)
              );
              this.messageBus.publish({
                type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_FAILED,
                data: { name },
              }, EventScope.EXPOSED);

              return EMPTY;
            }),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe(name => {
        this.messageBus.publish({
          type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_COMPLETED,
          data: { name },
        }, EventScope.EXPOSED);
        Debug.log(`Payment method initialized: ${name}`);
      });

    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.START_PAYMENT_METHOD),
        map((event: IMessageBusEvent<IStartPaymentMethod<unknown>>) => event.data),
        switchMap(({ name, data }: IStartPaymentMethod<unknown>) =>
          of(true).pipe(
            switchMap(() => this.getPaymentMethod(name).start(data)),
            tap(() => {
              this.googleAnalytics.sendGaData('event', name, EventType.BEGIN, `Payment by ${name} started`);
              this.messageBus.publish({
                type: PUBLIC_EVENTS.PAYMENT_METHOD_STARTED,
                data: { name },
              }, EventScope.EXPOSED);
            }),
            catchError((error: unknown) => {
              Debug.error(`Running payment method failed: ${name}`, error);
              this.sentryService.sendCustomMessage(
                PaymentError.duringProcess('Running payment method failed', name, error)
              );
              this.googleAnalytics.sendGaData('event', name, EventType.FAIL, `Payment by ${name} failed`);
              this.messageBus.publish({
                type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_FAILED,
                data: { name },
              }, EventScope.EXPOSED);

              return of(this.errorResultFactory.createResultFromError(error, name));
            }),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((result: IPaymentResult<unknown>) => {
        this.paymentResultHandler.handle(result);
        this.messageBus.publish({ type: PUBLIC_EVENTS.JWT_RESET });
      });

    this.destroy$.pipe(first()).subscribe(() => {
      this.paymentMethods.clear();
    });
  }

  hasPaymentMethod(name: string): boolean {
    return this.paymentMethods.has(name);
  }

  getPaymentMethod(name: string): IPaymentMethod {
    if (!this.hasPaymentMethod(name)) {
      throw new Error(`Payment method with name ${name} not found.`);
    }

    return this.paymentMethods.get(name);
  }
}
