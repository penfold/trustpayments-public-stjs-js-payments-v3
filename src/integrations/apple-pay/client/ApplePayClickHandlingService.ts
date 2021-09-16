import { Service } from 'typedi';
import { takeUntil, throttle } from 'rxjs/operators';
import { fromEvent, merge, Subscription } from 'rxjs';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';

@Service()
export class ApplePayClickHandlingService {
  private previousSubscription: Subscription;

  constructor(private messageBus: IMessageBus) {
  }

  bindClickHandler(callback: () => void, appleButtonPlacement: string): void {
    if (this.previousSubscription) {
      this.previousSubscription.unsubscribe();
    }

    const button = document.getElementById(appleButtonPlacement);

    if (!button) {
      throw new Error('There is no Apple Pay container in form');
    }

    const destroyEvent = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
    const submitEvent = this.messageBus.pipe(ofType(PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK)); // todo: replace with PAYMENT_METHOD_COMPLETED event or similar
    const cancelledEvent = this.messageBus.pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_CANCELLED));

    this.previousSubscription = fromEvent(button, 'click').pipe(
      throttle(() => merge(submitEvent, cancelledEvent)),
      takeUntil(destroyEvent),
    ).subscribe(() => callback());
  }
}
