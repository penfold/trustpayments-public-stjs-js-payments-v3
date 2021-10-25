import { Service } from 'typedi';
import { Observable, of, throwError } from 'rxjs';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { IAPMItemConfig } from '../models/IAPMItemConfig';
import { IAPMConfig } from '../models/IAPMConfig';
import { APMConfigResolver } from '../services/apm-config-resolver/APMConfigResolver';
import { IStartPaymentMethod } from '../../../application/core/services/payments/events/IStartPaymentMethod';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { Debug } from '../../../shared/Debug';
import { APMPaymentMethodName } from '../models/IAPMPaymentMethod';
import { APMName } from '../models/APMName';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { takeUntil } from 'rxjs/operators';
import './APMClient.scss';

@Service()
export class APMClient {
  private apmIcons: Record<APMName, string> = {
    [APMName.BITPAY]: require('./images/bitpay.svg'),
    [APMName.EPS]: require('./images/eps.svg'),
    [APMName.IDEAL]: require('./images/ideal.svg'),
    [APMName.MYBANK]: require('./images/mybank.svg'),
    [APMName.PAYU]: require('./images/payu.svg'),
    [APMName.POSTFINANCE]: require('./images/postfinance.svg'),
    [APMName.PRZELEWY24]: require('./images/przelewy24.svg'),
    [APMName.ZIP]: require('./images/zip.svg'),
  };

  constructor(
    private apmConfigResolver: APMConfigResolver,
    private messageBus: IMessageBus,
  ) {
  }

  init(config: IAPMConfig): Observable<undefined> {
    try {
      this.apmConfigResolver.resolve(config).apmList.forEach(itemConfig => this.insertAPMButton(itemConfig as IAPMItemConfig));
    } catch (error) {
      return throwError(() => error);
    }

    return of(undefined);
  }

  private insertAPMButton(apmItemConfig: IAPMItemConfig) {
    DomMethods.appendChildStrictIntoDOM(apmItemConfig.placement, this.createButtonForApmItem(apmItemConfig));
  }

  private createButtonForApmItem(apmItemConfig: IAPMItemConfig): HTMLElement {
    const button = DomMethods.createHtmlElement({ class: 'st-apm-button' }, 'div');
    if (this.apmIcons[apmItemConfig.name]) {
      button.innerHTML = `<img src='${this.apmIcons[apmItemConfig.name]}' alt='${apmItemConfig.name}' class='st-apm-button__img'>`;
    }
    button.addEventListener('click', (event) => this.onAPMButtonClick(event, apmItemConfig));

    return button;
  }

  private onAPMButtonClick(event: Event, config: IAPMItemConfig) {
    event.preventDefault();
    Debug.log(`Payment method initialized: ${config.name}. Payment button clicked`);
    this.processPayment(config);
  }

  private processPayment(config: IAPMItemConfig): void {
    const destroyEvent = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
    const paymentFailedEvent = this.messageBus.pipe(ofType(PUBLIC_EVENTS.PAYMENT_METHOD_FAILED));

    this.messageBus.publish<IStartPaymentMethod<IAPMItemConfig>>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        data: config,
        name: APMPaymentMethodName,
      },
    });

    this.messageBus.pipe(
      ofType(PUBLIC_EVENTS.APM_REDIRECT),
      takeUntil(destroyEvent),
      takeUntil(paymentFailedEvent),
    ).subscribe((event: IMessageBusEvent<string>) => {
      DomMethods.redirect(event.data);
    });
  }
}
