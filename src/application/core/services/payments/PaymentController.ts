import { ContainerInstance, Service } from 'typedi';
import { IPaymentMethod } from './IPaymentMethod';
import { PaymentMethodToken } from '../../../dependency-injection/InjectionTokens';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { EMPTY, Observable, of } from 'rxjs';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { catchError, first, map, mapTo, mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import { IInitPaymentMethod } from './events/IInitPaymentMethod';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IStartPaymentMethod } from './events/IStartPaymentMethod';
import { Debug } from '../../../../shared/Debug';
import { IPaymentResult } from './IPaymentResult';
import { PaymentResultHandler } from './PaymentResultHandler';

@Service()
export class PaymentController {
  private paymentMethods: Map<string, IPaymentMethod> = new Map();
  private destroy$: Observable<void>;

  constructor(
    private container: ContainerInstance,
    private messageBus: IMessageBus,
    private paymentResultHandler: PaymentResultHandler
  ) {
    this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
  }

  init(): void {
    const paymentMethods: IPaymentMethod[] = this.container.getMany(PaymentMethodToken);

    paymentMethods.forEach(paymentMethod => this.paymentMethods.set(paymentMethod.getName(), paymentMethod));

    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.INIT_PAYMENT_METHOD),
        map((event: IMessageBusEvent<IInitPaymentMethod<any>>) => event.data),
        mergeMap(({ name, config }: IInitPaymentMethod<any>) =>
          of(true).pipe(
            switchMap(() => this.getPaymentMethod(name).init(config)),
            mapTo(name),
            catchError((error: Error) => {
              Debug.error(`Payment method initialization failed: ${name}`, error);

              return EMPTY;
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(name => Debug.log(`Payment method initialized: ${name}`));

    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.START_PAYMENT_METHOD),
        map((event: IMessageBusEvent<IStartPaymentMethod<any>>) => event.data),
        switchMap(({ name, data }: IStartPaymentMethod<any>) =>
          of(true).pipe(
            switchMap(() => this.getPaymentMethod(name).start(data)),
            catchError((error: Error) => {
              Debug.error(`Running payment method failed: ${name}`, error);

              return EMPTY;
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((result: IPaymentResult<any>) => {
        this.paymentResultHandler.handle(result)
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
