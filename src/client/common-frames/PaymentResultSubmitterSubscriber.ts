import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IMessageSubscriber } from '../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
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
      .subscribe((event: IMessageBusEvent<SubmitData>) => this.paymentResultSubmitter.submitForm(event.data));

    messageBus
      .pipe(ofType(PUBLIC_EVENTS.APPEND_FORM_DATA), takeUntil(destroy$))
      .subscribe((event: IMessageBusEvent<SubmitData>) => this.paymentResultSubmitter.prepareForm(event.data));
  }
}
