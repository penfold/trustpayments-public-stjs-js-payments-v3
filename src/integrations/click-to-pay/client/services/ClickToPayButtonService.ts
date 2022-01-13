import { Service } from 'typedi';
import { fromEvent, merge, Subscription } from 'rxjs';
import { takeUntil, throttle } from 'rxjs/operators';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { IClickToPayConfig } from '../../models/IClickToPayConfig';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';

@Service()
export class ClickToPayButtonService {

  private previousSubscription: Subscription;

  constructor(
    private messageBus: IMessageBus
  ) {
  }

  insertClickToPayButton(config: IClickToPayConfig): Element {
    const { buttonPlacement = 'st-click-to-pay' } = config;

    return !this.isButtonInserted(buttonPlacement)
      ? DomMethods.appendChildStrictIntoDOM(buttonPlacement, this.createButton())
      : null;
  }

  bindClickHandler(callback: () => void, clickToPayButtonPlacement: string): void {
    if (this.previousSubscription) {
      this.previousSubscription.unsubscribe();
    }

    const button = document.getElementById(clickToPayButtonPlacement);

    if (!button) {
      throw new Error('There is no ClickToPay container in form');
    }

    const destroyEvent = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
    const submitEvent = this.messageBus.pipe(ofType(PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK)); // todo: replace with PAYMENT_METHOD_COMPLETED event or similar
    const cancelledEvent = this.messageBus.pipe(ofType(PUBLIC_EVENTS.CLICK_TO_PAY_CANCELLED));

    this.previousSubscription = fromEvent(button, 'click').pipe(
      throttle(() => merge(submitEvent, cancelledEvent)),
      takeUntil(destroyEvent),
    ).subscribe(() => callback());
  }

  protected createButton(): HTMLElement {
    return DomMethods.createHtmlElement.apply(this, [
      {
        src: 'https://sandbox-assets.secure.checkout.visa.com/wallet-services-web/xo/button.png?size=302&color=dark&animation=true&legacy=false&svg=true&orderedCardBrands=VISA%2CMASTERCARD%2CAMEX',
      },
      'img',
    ]);
  }

  private isButtonInserted(buttonPlacement: string): boolean {
    return document.getElementById(buttonPlacement) ? !!document.getElementById(buttonPlacement).querySelector('img') : false;
  }

}
