import { forkJoin, Observable, mapTo, throwError } from 'rxjs';
import { Inject, Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { ApplePayPaymentMethodName } from '../models/IApplePayPaymentMethod';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IConfig } from '../../../shared/model/config/IConfig';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IGatewayClient } from '../../../application/core/services/gateway-client/IGatewayClient';
import { TransportServiceGatewayClient } from '../../../application/core/services/gateway-client/TransportServiceGatewayClient';
import { switchMap } from 'rxjs/operators';
import { ApplePayResponseHandlerService } from './ApplePayResponseHandlerService';
import { IApplePayGatewayRequest } from '../models/IApplePayRequest';
import { IApplePayProcessPaymentResponse } from '../../../application/core/integrations/apple-pay/apple-pay-payment-service/IApplePayProcessPaymentResponse';
import { IApplePayValidateMerchantRequest } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';

@Service({ id: PaymentMethodToken, multiple: true })
export class ApplePayPaymentMethod implements IPaymentMethod<IConfig, IApplePayConfigObject, IRequestTypeResponse> {
  private requestProcessingService: Observable<IRequestProcessingService>;

  constructor(
    private requestProcessingInitializer: RequestProcessingInitializer,
    private frameQueryingService: IFrameQueryingService,
    @Inject(() => TransportServiceGatewayClient) private gatewayClient: IGatewayClient,
    private applePayResponseHandlerService: ApplePayResponseHandlerService,
  ) {}

  getName(): string {
    return ApplePayPaymentMethodName;
  }

  init(config: IConfig): Observable<void> {
    this.requestProcessingService = this.requestProcessingInitializer.initialize();

    const initClientQueryEvent: IMessageBusEvent = {
      type: PUBLIC_EVENTS.APPLE_PAY_INIT_CLIENT,
      data: config,
    };

    return forkJoin([
      this.requestProcessingService,
      this.frameQueryingService.query(initClientQueryEvent, MERCHANT_PARENT_FRAME),
    ]).pipe(mapTo(undefined));
  }

  start(config: IApplePayConfigObject): Observable<IPaymentResult<IRequestTypeResponse>> {
    return new Observable<IPaymentResult<IRequestTypeResponse>>(subscriber => {
      this.frameQueryingService.whenReceive(
        PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT_2,
        (event: IMessageBusEvent<IApplePayValidateMerchantRequest>) => {
          return this.applePayResponseHandlerService.handleWalletVerifyResponse(
            this.gatewayClient.walletVerify(event.data),
            subscriber,
          );
        },
      );

      this.frameQueryingService.whenReceive(
        PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION_2,
        (event: IMessageBusEvent<IApplePayGatewayRequest>) => {
          return this.applePayResponseHandlerService.handlePaymentResponse(
            this.authorizePayment(event.data, config.merchantUrl),
            subscriber,
          );
        },
      );

      this.frameQueryingService.whenReceive(
        PUBLIC_EVENTS.APPLE_PAY_CANCELLED, 
        () => this.paymentCancelled()
      );
    });
  }

  private authorizePayment(request: IApplePayGatewayRequest, merchantUrl: string): Observable<IApplePayProcessPaymentResponse> {
    return this.requestProcessingService.pipe(
      switchMap(requestProcessingService => {
        return requestProcessingService.process(request, merchantUrl) as Observable<IApplePayProcessPaymentResponse>;
      }),
    );
  }

  private paymentCancelled() {
    return throwError(() => new Error('Payment has been cancelled'));
  }
}
