import { IConfig } from '../../../shared/model/config/IConfig';
import { ApplePayConfigService } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/ApplePayConfigService';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { APPLE_PAY_BUTTON_ID } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonProperties';
import { ApplePayButtonService } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonService';
import { ApplePaySessionService } from '../../../client/integrations/apple-pay/apple-pay-session-service/ApplePaySessionService';
import { Observable, of, throwError, map, tap } from 'rxjs';
import { Service } from 'typedi';
import { ApplePayInitError } from '../models/errors/ApplePayInitError';
import { ApplePayGestureService } from '../../../application/core/integrations/apple-pay/apple-pay-gesture-service/ApplePayGestureService';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IApplePayGatewayRequest } from '../models/IApplePayRequest';
import { IStartPaymentMethod } from '../../../application/core/services/payments/events/IStartPaymentMethod';
import { ApplePayPaymentMethodName } from '../models/IApplePayPaymentMethod';
import { IApplePayPaymentRequest } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IApplePaySession } from '../../../client/integrations/apple-pay/apple-pay-session-service/IApplePaySession';
import { ApplePaySessionFactory } from '../../../client/integrations/apple-pay/apple-pay-session-service/ApplePaySessionFactory';
import { IApplePayValidateMerchantEvent } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantEvent';
import { ApplePayPaymentService } from '../../../application/core/integrations/apple-pay/apple-pay-payment-service/ApplePayPaymentService';
import { ApplePayClientErrorCode } from '../../../application/core/integrations/apple-pay/ApplePayClientErrorCode';
import { IApplePayWalletVerifyResponseBody } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';
import { EventScope } from '../../../application/core/models/constants/EventScope';

@Service()
export class ApplePayClient {
  private applePaySession: IApplePaySession;

  constructor(
    private applePayConfigService: ApplePayConfigService,
    private applePayButtonService: ApplePayButtonService,
    private applePaySessionService: ApplePaySessionService,
    private applePayGestureService: ApplePayGestureService,
    private messageBus: IMessageBus,
    private applePaySessionFactory: ApplePaySessionFactory,
    private applePayPaymentService: ApplePayPaymentService,
  ) {
  }

  init(config: IConfig): Observable<void> {
    return this.isApplePayAvailable(config).pipe(
      map(config => this.resolveApplePayConfig(config)),
      map(applePayConfig => this.insertApplePayButton(applePayConfig)),
    );
  }

  private isApplePayAvailable(config: IConfig): Observable<IConfig> {
    const notAvailable = (reason: string): Observable<never> => {
      return throwError(() => new ApplePayInitError(`ApplePay not available: ${reason}`));
    }

    if (!this.applePaySessionService.hasApplePaySessionObject()) {
      return notAvailable('Works only on Safari');
    }

    if (!this.applePaySessionService.canMakePayments()) {
      return notAvailable('Your device does not support making payments with Apple Pay');
    }

    // return this.applePaySessionService.canMakePaymentsWithActiveCard(config.applePay.merchantId).pipe(
    //   switchMap(canMakePayments => canMakePayments ? of(config) : notAvailable('No active cards in the wallet.')),
    // );

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

  private processPayment(paymentRequest: IApplePayPaymentRequest): void {
    this.messageBus.publish<IStartPaymentMethod<IApplePayPaymentRequest>>({
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        data: {
          ...paymentRequest,
        },
        name: ApplePayPaymentMethodName,
      },
    });
  }

  private insertApplePayButton(config: IApplePayConfigObject): void {
    this.applePayButtonService.insertButton(
      APPLE_PAY_BUTTON_ID,
      config.applePayConfig.buttonText,
      config.applePayConfig.buttonStyle,
      config.applePayConfig.paymentRequest.countryCode,
    );

    this.applePayGestureService.gestureHandle(() => {
      this.initApplePaySession(config);
      this.processPayment(config.paymentRequest)
    }, APPLE_PAY_BUTTON_ID);
  }

  private initApplePaySession(config: IApplePayConfigObject): void {
    this.applePaySession = this.applePaySessionFactory.create(config.applePayVersion, config.paymentRequest);
    this.applePaySessionService.init(this.applePaySession, config.paymentRequest);
    this.onValidateMerchant(config);
    this.onPaymentAuthorized();
    this.onCancel();
    this.onTransactionComplete();
  }

  private onValidateMerchant(config: IApplePayConfigObject): void {
    this.applePaySession.onvalidatemerchant = (event: IApplePayValidateMerchantEvent) => {
      this.applePayPaymentService
        .walletVerify(config.validateMerchantRequest, event.validationURL, false)
        .pipe(
          tap((response: { status: ApplePayClientErrorCode; data: IApplePayWalletVerifyResponseBody }) => {
            this.messageBus.publish(
              {
                type: PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT_2,
                data: {
                  status: response.status,
                  details: response.data,
                },
              },
              EventScope.ALL_FRAMES
            );
          }),
        );
    }
  }

  private onPaymentAuthorized(): void {
    console.log('onPaymentAuthorized');
  }

  private onCancel(): void {
    console.log('onCancel');
  }

  private onTransactionComplete(): void {
    console.log('onTransactionComplete');
  }
}
