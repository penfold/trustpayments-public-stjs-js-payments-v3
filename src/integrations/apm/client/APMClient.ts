import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { map, mapTo, switchMap, takeUntil, tap } from 'rxjs/operators';
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
import './APMClient.scss';
import { APMFilterService } from '../services/apm-filter-service/APMFilterService';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { GAEventType } from '../../../application/core/integrations/google-analytics/events';
import { untilDestroy } from '../../../shared/services/message-bus/operators/untilDestroy';

@Service()
export class APMClient {
  private apmIcons: Record<APMName, string> = {
    [APMName.ACCOUNT2ACCOUNT]: '',
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
  private destroy$: Observable<void>;

  constructor(
    private apmConfigResolver: APMConfigResolver,
    private messageBus: IMessageBus,
    private apmFilterService: APMFilterService,
    private configProvider: ConfigProvider,
    private googleAnalytics: GoogleAnalytics
  ) {}

  init(config: IAPMConfig): Observable<undefined> {
    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.UPDATE_JWT),
        map(event => event.data.newJwt),
        switchMap(updatedJwt => this.filter(config, updatedJwt)),
        untilDestroy(this.messageBus)
      )
      .subscribe((list: IAPMItemConfig[]) => this.insertAPMButtons(list));

    return this.filter(config, this.configProvider.getConfig().jwt).pipe(
      tap((list: IAPMItemConfig[]) => this.insertAPMButtons(list)),
      mapTo(undefined)
    );
  }

  private filter(config: IAPMConfig, jwt: string): Observable<IAPMItemConfig[]> {
    return this.apmConfigResolver.resolve(config).pipe(
      switchMap(normalizedConfig => this.apmFilterService.filter(normalizedConfig.apmList as IAPMItemConfig[], jwt)),
      untilDestroy(this.messageBus)
    ) as Observable<IAPMItemConfig[]>;
  }

  private insertAPMButtons(itemList: IAPMItemConfig[]): void {
    this.clearExistingButtons();
    itemList.forEach((item: IAPMItemConfig) => {
      this.insertAPMButton(item);
    });
  }

  private clearExistingButtons(): void {
    document.querySelectorAll('div.st-apm-button').forEach(element => element.remove());
  }

  private insertAPMButton(apmItemConfig: IAPMItemConfig): void {
    DomMethods.appendChildStrictIntoDOM(apmItemConfig.placement, this.createButtonForApmItem(apmItemConfig));
  }

  private createButtonForApmItem(apmItemConfig: IAPMItemConfig): HTMLElement {
    const button = DomMethods.createHtmlElement({ class: 'st-apm-button' }, 'div');
    if (this.apmIcons[apmItemConfig.name]) {
      button.innerHTML = `<img src='${this.apmIcons[apmItemConfig.name]}' alt='${apmItemConfig.name}' id='ST-APM-${
        apmItemConfig.name
      }' class='st-apm-button__img'>`;
    } else {
      button.innerHTML = `
          <button
            class = 'st-apm-button__button'
            id='ST-APM-${apmItemConfig.name}'
            style='
              width: ${apmItemConfig.button.width};
              height: ${apmItemConfig.button.height};
              background-color: ${apmItemConfig.button.backgroundColor};
              color: ${apmItemConfig.button.textColor};'
              type='button'
            >${apmItemConfig.button.text}</button>
         `;
    }
    button.addEventListener('click', event => this.onAPMButtonClick(event, apmItemConfig));

    return button;
  }

  private onAPMButtonClick(event: Event, config: IAPMItemConfig) {
    event.preventDefault();
    Debug.log(`Payment method initialized: ${config.name}. Payment button clicked`);
    this.processPayment(config);
  }

  private processPayment(config: IAPMItemConfig): void {
    const paymentFailedEvent = this.messageBus.pipe(ofType(PUBLIC_EVENTS.PAYMENT_METHOD_FAILED));

    this.messageBus.publish<IStartPaymentMethod<IAPMItemConfig>>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        data: config,
        name: APMPaymentMethodName,
      },
    });

    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.APM_REDIRECT), untilDestroy(this.messageBus), takeUntil(paymentFailedEvent))
      .subscribe((event: IMessageBusEvent<string>) => {
        this.googleAnalytics.sendGaData(
          'event',
          'APM redirect',
          GAEventType.REDIRECT,
          `APM redirect initiated: ${config.name}`
        );
        DomMethods.redirect(event.data);
      });
  }
}
