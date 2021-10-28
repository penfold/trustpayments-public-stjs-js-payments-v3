import { Service } from 'typedi';
import { combineLatest, Observable, of, throwError } from 'rxjs';
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
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import './APMClient.scss';
import { APMFilterService } from '../services/apm-filter-service/APMFilterService';
import { IUpdateJwt } from '../../../application/core/models/IUpdateJwt';

@Service()
export class APMClient {
  private apmIcons: Record<APMName, string> = {
    [APMName.ALIPAY]: require('./images/alipay.svg'),
    [APMName.BANCONTACT]: require('./images/bancontact.svg'),
    [APMName.BITPAY]: require('./images/bitpay.svg'),
    [APMName.EPS]: require('./images/eps.svg'),
    [APMName.GIROPAY]: require('./images/giropay.svg'),
    [APMName.IDEAL]: require('./images/ideal.svg'),
    [APMName.MULTIBANCO]: require('./images/multibanco.svg'),
    [APMName.MYBANK]: require('./images/mybank.svg'),
    [APMName.PAYU]: require('./images/payu.svg'),
    [APMName.POSTFINANCE]: require('./images/postfinance.svg'),
    [APMName.PRZELEWY24]: require('./images/przelewy24.svg'),
    [APMName.REDPAGOS]: require('./images/redpagos.svg'),
    [APMName.SAFETYPAY]: require('./images/safetypay.svg'),
    [APMName.SEPADD]: require('./images/sepadd.svg'),
    [APMName.SOFORT]: require('./images/sofort.svg'),
    [APMName.TRUSTLY]: require('./images/trustly.svg'),
    [APMName.UNIONPAY]: require('./images/unionpay.svg'),
    [APMName.WECHATPAY]: require('./images/wechatpay.svg'),
    [APMName.ZIP]: require('./images/zip.svg'),
  };
  private apmConfig: IAPMConfig;
  private destroy$: Observable<void>;

  constructor(
    private apmConfigResolver: APMConfigResolver,
    private messageBus: IMessageBus,
    private apmFilterService: APMFilterService,
  ) {
    this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
  }

  init(config: IAPMConfig): Observable<undefined> {
    this.apmConfig = config;
    this.filter(config);
    return of(undefined);
  }

  private jwtChanges(): Observable<IUpdateJwt> {
    return this.messageBus.pipe(ofType(PUBLIC_EVENTS.UPDATE_JWT), takeUntil(this.destroy$));
  }

  private filter(config: IAPMConfig): Observable<undefined> {
    try {
      combineLatest([this.jwtChanges(), this.apmConfigResolver.resolve(config)]).pipe(
        switchMap(([updatedJwt, config]) => this.apmFilterService.filter(config.apmList as IAPMItemConfig[], updatedJwt.newJwt)),
          tap((list: IAPMItemConfig[]) => {
            list.forEach((item: IAPMItemConfig) => {
              // this.clear(item);
              return this.insertAPMButton(item as IAPMItemConfig);
            });
          })).subscribe();
    } catch (error) {
      return throwError(() => error);
    }
  }

  private removeDuplicate(apmItemConfig: IAPMItemConfig): void {
    const child: HTMLElement = document.getElementById(apmItemConfig.name);
    if (child) {
      document.getElementById(apmItemConfig.placement).removeChild(child);
    }
  }

  private insertAPMButton(apmItemConfig: IAPMItemConfig) {
    DomMethods.appendChildStrictIntoDOM(apmItemConfig.placement, this.createButtonForApmItem(apmItemConfig));
  }

  private createButtonForApmItem(apmItemConfig: IAPMItemConfig): HTMLElement {
    const button = DomMethods.createHtmlElement({ class: 'st-apm-button' }, 'div');
    if (this.apmIcons[apmItemConfig.name]) {
      button.innerHTML = `<img src='${this.apmIcons[apmItemConfig.name]}' alt='${apmItemConfig.name}' id='${apmItemConfig.name}' class='st-apm-button__img'>`;
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
