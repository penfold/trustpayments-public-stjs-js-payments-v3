import { Inject, Service } from 'typedi';
import { first, takeUntil } from 'rxjs/operators';
import { IMessageSubscriber } from '../../shared/services/message-bus/interfaces/IMessageSubscriber';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { MessageSubscriberToken, WINDOW } from '../../shared/dependency-injection/InjectionTokens';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';

@Service({ id: MessageSubscriberToken, multiple: true })
export class PreventNavigationPopup implements IMessageSubscriber {
  constructor(@Inject(WINDOW) private window: Window) {}

  register(messageBus: IMessageBus): void {
    const destroy = messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = undefined;
    };

    messageBus
      .pipe(ofType(PUBLIC_EVENTS.SUBMIT_FORM), takeUntil(destroy))
      .subscribe(() => this.window.addEventListener('beforeunload', beforeUnloadHandler));

    messageBus
      .pipe(ofType(PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK), takeUntil(destroy))
      .subscribe(() => this.window.removeEventListener('beforeunload', beforeUnloadHandler));

    messageBus
      .pipe(ofType(PUBLIC_EVENTS.DESTROY), first())
      .subscribe(() => this.window.removeEventListener('beforeunload', beforeUnloadHandler));

  }
}
