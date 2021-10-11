import { IConfig } from '../../../shared/model/config/IConfig';
import { ApplePayConfigService } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/ApplePayConfigService';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { APPLE_PAY_BUTTON_ID } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonProperties';
import { ApplePayButtonService } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonService';
import { Observable, of, throwError, map } from 'rxjs';
import { Service } from 'typedi';
import { ApplePayInitError } from '../models/errors/ApplePayInitError';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IApplePaySession } from './IApplePaySession';
import { ApplePayClickHandlingService } from './ApplePayClickHandlingService';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ApplePaySessionFactory } from './ApplePaySessionFactory';
import { ApplePayPaymentMethodName } from '../models/IApplePayPaymentMethod';
import { MerchantValidationService } from './MerchantValidationService';
import { mapTo, takeUntil, tap } from 'rxjs/operators';
import { IStartPaymentMethod } from '../../../application/core/services/payments/events/IStartPaymentMethod';
import { PaymentAuthorizationService } from './PaymentAuthorizationService';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IUpdateJwt } from '../../../application/core/models/IUpdateJwt';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { ApplePayClientStatus } from '../../../application/core/integrations/apple-pay/ApplePayClientStatus';
import { PaymentCancelService } from './PaymentCancelService';
import { IApplePaySessionWrapper } from './interfaces/IApplePaySessionWrapper';


@Service()
export class ApplePayClient {
  private applePaySession: IApplePaySession;

  constructor(
    private applePayConfigService: ApplePayConfigService,
    private applePayButtonService: ApplePayButtonService,
    private applePaySessionWrapper: IApplePaySessionWrapper,
    private applePayButtonClickService: ApplePayClickHandlingService,
    private applePaySessionFactory: ApplePaySessionFactory,
    private messageBus: IMessageBus,
    private merchantValidationService: MerchantValidationService,
    private paymentAuthorizationService: PaymentAuthorizationService,
    private paymentCancelService: PaymentCancelService,
    private googleAnalytics: GoogleAnalytics,
  ) {
  }

  init(config: IConfig): Observable<void> {
    this.updateJwtListener(config);

    return this.isApplePayAvailable(config).pipe(
      map(config => this.resolveApplePayConfig(config)),
      tap(applePayConfig => this.insertApplePayButton(applePayConfig)),
      tap(applePayConfig => this.initGestureHandler(applePayConfig)),
      tap(() => {
        this.googleAnalytics.sendGaData(
          'event',
          'Apple Pay',
          `${ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD}`,
          'Can make payment',
        );
      }),
      mapTo(undefined),
    );
  }

  private updateJwtListener(config: IConfig): void {
    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.UPDATE_JWT),
        takeUntil(this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY)))
      )
      .subscribe((event: IMessageBusEvent<IUpdateJwt>) => {
        this.initGestureHandler(this.resolveApplePayConfig({ ...config, jwt: event.data.newJwt }));
      });
  }

  private isApplePayAvailable(config: IConfig): Observable<IConfig> {
    const notAvailable = (reason: string): Observable<never> => {
      return throwError(() => new ApplePayInitError(`ApplePay not available: ${reason}`));
    }

    if (!this.applePaySessionWrapper.isApplePaySessionAvailable()) {
      return notAvailable('Works only on Safari');
    }

    if (!this.applePaySessionWrapper.canMakePayments()) {
      return notAvailable('Your device does not support making payments with Apple Pay');
    }

    return of(config);
  }

  private resolveApplePayConfig(config: IConfig): IApplePayConfigObject {
    return this.applePayConfigService.getConfig(config, {
      walletmerchantid: '',
      walletrequestdomain: window.location.hostname,
      walletsource: 'APPLEPAY',
      walletvalidationurl: '',
    });
  }

  private insertApplePayButton(config: IApplePayConfigObject): void {
    this.applePayButtonService.insertButton(
      config.applePayConfig.buttonPlacement || APPLE_PAY_BUTTON_ID,
      config.applePayConfig.buttonText,
      config.applePayConfig.buttonStyle,
      config.applePayConfig.paymentRequest.countryCode,
    );
  }

  private initApplePaySession(config: IApplePayConfigObject): void {
    this.applePaySession = this.applePaySessionFactory.create(config.applePayVersion, config.paymentRequest);
    this.merchantValidationService.init(this.applePaySession, config);
    this.paymentAuthorizationService.init(this.applePaySession, config);
    this.paymentCancelService.init(this.applePaySession);
    this.applePaySession.begin();
  }

  private startPaymentProcess(config: IApplePayConfigObject): void {
    this.messageBus.publish<IStartPaymentMethod<IApplePayConfigObject>>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        data: config,
        name: ApplePayPaymentMethodName,
      },
    });
  }

  private initGestureHandler(config: IApplePayConfigObject): void {
    this.applePayButtonClickService.bindClickHandler(() => {
      this.startPaymentProcess(config);
      this.initApplePaySession(config);
    }, config.applePayConfig.buttonPlacement || APPLE_PAY_BUTTON_ID);
  }
}
