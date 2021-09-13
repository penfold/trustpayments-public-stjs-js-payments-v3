import { IConfig } from '../../../shared/model/config/IConfig';
import { ApplePayConfigService } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/ApplePayConfigService';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { APPLE_PAY_BUTTON_ID } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonProperties';
import { ApplePayButtonService } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonService';
import { ApplePaySessionService } from '../../../client/integrations/apple-pay/apple-pay-session-service/ApplePaySessionService';
import { Observable, of, throwError, map } from 'rxjs';
import { Service } from 'typedi';
import { ApplePayInitError } from '../models/errors/ApplePayInitError';
import { ApplePayGestureService } from '../../../application/core/integrations/apple-pay/apple-pay-gesture-service/ApplePayGestureService';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IStartPaymentMethod } from '../../../application/core/services/payments/events/IStartPaymentMethod';
import { ApplePayPaymentMethodName } from '../models/IApplePayPaymentMethod';
import { IApplePayPaymentRequest } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IApplePaySession } from '../../../client/integrations/apple-pay/apple-pay-session-service/IApplePaySession';
import { ApplePaySessionFactory } from '../../../client/integrations/apple-pay/apple-pay-session-service/ApplePaySessionFactory';
import { IApplePayValidateMerchantEvent } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantEvent';
import { IApplePayWalletVerifyResponseBody } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';
import { IApplePayValidateMerchantRequest } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { CONTROL_FRAME_IFRAME } from '../../../application/core/models/constants/Selectors';
import { IApplePayPaymentAuthorizedEvent } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';
import { FrameQueryingService } from '../../../shared/services/message-bus/FrameQueryingService';

@Service()
export class ApplePayClient {
  private applePaySession: IApplePaySession;

  constructor(
    private applePayConfigService: ApplePayConfigService,
    private applePayButtonService: ApplePayButtonService,
    private applePaySessionService: ApplePaySessionService,
    private applePayGestureService: ApplePayGestureService,
    private applePaySessionFactory: ApplePaySessionFactory,
    private frameQueryingService: FrameQueryingService,
    private messageBus: IMessageBus,
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

    this.applePayGestureService.gestureHandle(() => {
      this.initApplePaySession(config);
      this.startPaymentProcess(config.paymentRequest)
    }, config.applePayConfig.buttonPlacement || APPLE_PAY_BUTTON_ID);
  }

  private initApplePaySession(config: IApplePayConfigObject): void {
    this.applePaySession = this.applePaySessionFactory.create(config.applePayVersion, config.paymentRequest);
    this.applePaySession.onvalidatemerchant = (event: IApplePayValidateMerchantEvent) => this.onValidateMerchant(event, config);
    this.applePaySession.onpaymentauthorized = (event: IApplePayPaymentAuthorizedEvent) => this.onPaymentAuthorized(event, config);
    this.applePaySession.begin();

    // this.onPaymentAuthorized();
    // this.onCancel();
    // this.onTransactionComplete();
  }

  private startPaymentProcess(paymentRequest: IApplePayPaymentRequest): void {
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

  private onValidateMerchant(event: IApplePayValidateMerchantEvent, config: IApplePayConfigObject): void {
    const validateMerchantQueryEvent: IMessageBusEvent<IApplePayValidateMerchantRequest> = {
      type: PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT_2,
      data: {
        ...config.validateMerchantRequest,
        walletvalidationurl: event.validationURL,
      },
    };

    this.frameQueryingService.query(validateMerchantQueryEvent, CONTROL_FRAME_IFRAME).subscribe({
      next: (response: IApplePayWalletVerifyResponseBody) => {
        this.applePaySession.completeMerchantValidation(JSON.parse(response.walletsession));
      },
      error: () => {
        this.applePaySession.abort();
      },
    });
  }

  private onPaymentAuthorized(event: IApplePayPaymentAuthorizedEvent, config: IApplePayConfigObject): void {
    console.log(event);
  }

  private onCancel(): void {
    console.log('onCancel');
  }

  private onTransactionComplete(): void {
    console.log('onTransactionComplete');
  }
}
