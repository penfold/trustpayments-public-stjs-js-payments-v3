import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Service } from 'typedi';
import { MessageSubscriberToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { IMessageSubscriber } from '../../../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { GAEventType } from './events';
import { GoogleAnalytics } from './GoogleAnalytics';

@Service({ id: MessageSubscriberToken, multiple: true })
export class PaymentEventsSubscriber implements IMessageSubscriber {
  constructor(private googleAnalytics: GoogleAnalytics) {}

  register(messageBus: IMessageBus): void {
    const destroy$: Observable<void> = messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));

    messageBus
      .pipe(ofType(PUBLIC_EVENTS.PAYMENT_METHOD_INIT_STARTED), takeUntil(destroy$))
      .subscribe((event: IMessageBusEvent<any>) => {
        this.googleAnalytics.sendGaData('event', event.data.name, GAEventType.INIT, `Payment method ${event.data.name} init started`);
      });
    
    messageBus
      .pipe(ofType(PUBLIC_EVENTS.PAYMENT_METHOD_INIT_COMPLETED), takeUntil(destroy$))
      .subscribe((event: IMessageBusEvent<any>) => {
        this.googleAnalytics.sendGaData('event', event.data.name, GAEventType.INIT, `Payment method ${event.data.name} init completed`);
      });
    
    messageBus
      .pipe(ofType(PUBLIC_EVENTS.PAYMENT_METHOD_INIT_FAILED), takeUntil(destroy$))
      .subscribe((event: IMessageBusEvent<any>) => {
        this.googleAnalytics.sendGaData('event', event.data.name, GAEventType.INIT, `Payment method ${event.data.name} init failed`);
      });
    
    messageBus
      .pipe(ofType(PUBLIC_EVENTS.PAYMENT_METHOD_STARTED), takeUntil(destroy$))
      .subscribe((event: IMessageBusEvent<any>) => {
        this.googleAnalytics.sendGaData('event', event.data.name, GAEventType.PAYMENT, `Payment by ${event.data.name} started`);
      });
    
    messageBus
      .pipe(ofType(PUBLIC_EVENTS.PAYMENT_METHOD_COMPLETED), takeUntil(destroy$))
      .subscribe((event: IMessageBusEvent<any>) => {
        this.googleAnalytics.sendGaData('event', event.data.name, GAEventType.PAYMENT, `Payment by ${event.data.name} completed`);
      });
    
    messageBus
      .pipe(ofType(PUBLIC_EVENTS.PAYMENT_METHOD_FAILED), takeUntil(destroy$))
      .subscribe((event: IMessageBusEvent<any>) => {
        this.googleAnalytics.sendGaData('event', event.data.name, GAEventType.PAYMENT, `Payment by ${event.data.name} failed`);
      });
    
    messageBus
      .pipe(ofType(PUBLIC_EVENTS.PAYMENT_METHOD_CANCELED), takeUntil(destroy$))
      .subscribe((event: IMessageBusEvent<any>) => {
        this.googleAnalytics.sendGaData('event', event.data.name, GAEventType.PAYMENT, `Payment by ${event.data.name} canceled`);
      });
  }
}