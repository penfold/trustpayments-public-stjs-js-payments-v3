import { Service } from 'typedi';
import { IMessageSubscriber } from '../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { Observable } from 'rxjs';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { takeUntil } from 'rxjs/operators';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';
import { MessageSubscriberToken } from '../../shared/dependency-injection/InjectionTokens';
import { PaymentResultSubmitter } from './PaymentResultSubmitter';

type SubmitData = Record<string, string>;

@Service({ id: MessageSubscriberToken, multiple: true })
export class PaymentResultSubmitterSubscriber implements IMessageSubscriber {
  constructor(private paymentResultSubmitter: PaymentResultSubmitter) {}

  register(messageBus: IMessageBus): void {
    const destroy$: Observable<void> = messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));

    messageBus
      .pipe(ofType(PUBLIC_EVENTS.SUBMIT_PAYMENT_RESULT), takeUntil(destroy$))
      .subscribe((event: IMessageBusEvent<SubmitData>) => this.paymentResultSubmitter.submit(event.data));
  }
}