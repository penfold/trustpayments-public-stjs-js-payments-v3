import { Observable } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Service } from 'typedi';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../../application/core/models/IMessageBusEvent';
import { IInitPaymentMethod } from '../../../../application/core/services/payments/events/IInitPaymentMethod';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { GooglePaymentMethodName } from '../../../../integrations/google-pay/models/IGooglePaymentMethod';
import { MessageSubscriberToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IMessageSubscriber } from '../../../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { GooglePay } from '../GooglePay';

@Service({ id: MessageSubscriberToken, multiple: true })
export class GooglePayInitializeSubscriber implements IMessageSubscriber {
  constructor(private googlePay: GooglePay) {}

  register(messageBus: IMessageBus): void {
    const destroy$: Observable<void> = messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));

    messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.INIT_PAYMENT_METHOD),
        filter((event: IMessageBusEvent<IInitPaymentMethod<IConfig>>) => {
          return event.data.name === GooglePaymentMethodName;
        }),
        takeUntil(destroy$),
      )
      .subscribe((event: IMessageBusEvent<IInitPaymentMethod<IConfig>>) => {
        this.googlePay.init(event.data.config);
      });
  }
}
