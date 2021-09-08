import { IConfig } from '../../../shared/model/config/IConfig';
import { ApplePayConfigService } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/ApplePayConfigService';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { APPLE_PAY_BUTTON_ID } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonProperties';
import { ApplePayButtonService } from '../../../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonService';
import { ApplePaySessionService } from '../../../client/integrations/apple-pay/apple-pay-session-service/ApplePaySessionService';
import { Observable, of, throwError, map, switchMap } from 'rxjs';
import { Service } from 'typedi';
import { ApplePayInitError } from '../models/errors/ApplePayInitError';
import { ApplePayGestureService } from '../../../application/core/integrations/apple-pay/apple-pay-gesture-service/ApplePayGestureService';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IApplePayGatewayRequest } from '../models/IApplePayRequest';
import { IStartPaymentMethod } from '../../../application/core/services/payments/events/IStartPaymentMethod';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { ApplePayPaymentMethodName } from '../models/IApplePayPaymentMethod';
import { IApplePayPaymentRequest } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentRequest';

@Service()
export class ApplePayClient {
  constructor(
    private applePayConfigService: ApplePayConfigService,
    private applePayButtonService: ApplePayButtonService,
    private applePaySessionService: ApplePaySessionService,
    private applePayGestureService: ApplePayGestureService,
    private interFrameCommunicator: InterFrameCommunicator
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
    const queryEvent = {
      type: PUBLIC_EVENTS.START_PAYMENT_METHOD,
      data: {
        data: {
          walletsource: 'APPLEPAY',
          ...paymentRequest,
        },
        name: ApplePayPaymentMethodName,
      },
    };

    this.interFrameCommunicator.query<IStartPaymentMethod<IApplePayGatewayRequest>>(queryEvent, MERCHANT_PARENT_FRAME);
  }

  private insertApplePayButton(config: IApplePayConfigObject): void {
    this.applePayButtonService.insertButton(
      APPLE_PAY_BUTTON_ID,
      config.applePayConfig.buttonText,
      config.applePayConfig.buttonStyle,
      config.applePayConfig.paymentRequest.countryCode,
    );

    this.applePayGestureService.gestureHandle(this.processPayment.bind(config.paymentRequest), APPLE_PAY_BUTTON_ID);
  }
}
