import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Service } from 'typedi';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { MessageSubscriberToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { IMessageSubscriber } from '../../../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { GooglePay } from '../GooglePay';

@Service({ id: MessageSubscriberToken, multiple: true })
export class GooglePayInitializeSubscriber implements IMessageSubscriber {
  constructor(private googlePay: GooglePay) {}

  register(messageBus: IMessageBus) {
    const destroy$: Observable<void> = messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));

    messageBus
      .pipe(ofType(PUBLIC_EVENTS.INIT_PAYMENT_METHOD), takeUntil(destroy$))
      .subscribe(config => {
        this.googlePay.init(config);
      });
  }
}
