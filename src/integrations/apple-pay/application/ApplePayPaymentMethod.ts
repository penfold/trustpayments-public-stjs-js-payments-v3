import { forkJoin, mapTo, Observable, Subject, throwError } from 'rxjs';
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
import { IApplePayValidateMerchantRequest } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IApplePayWalletVerifyResponseBody } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';
import { IConfig } from '../../../shared/model/config/IConfig';
import { IGatewayClient } from '../../../application/core/services/gateway-client/IGatewayClient';
import { TransportServiceGatewayClient } from '../../../application/core/services/gateway-client/TransportServiceGatewayClient';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IApplePayGatewayRequest } from '../models/IApplePayRequest';
import { IApplePayProcessPaymentResponse } from '../../../application/core/integrations/apple-pay/apple-pay-payment-service/IApplePayProcessPaymentResponse';
import { ApplePayResultHandlerService } from './ApplePayResultHandlerService';

@Service({ id: PaymentMethodToken, multiple: true })
export class ApplePayPaymentMethod implements IPaymentMethod<IConfig, undefined, IRequestTypeResponse> {
  private requestProcessingService: Observable<IRequestProcessingService>;
  private paymentResult: Subject<IPaymentResult<IRequestTypeResponse>> = new Subject();
  private config: IConfig;

  constructor(
    private requestProcessingInitializer: RequestProcessingInitializer,
    private frameQueryingService: IFrameQueryingService,
    @Inject(() => TransportServiceGatewayClient) private gatewayClient: IGatewayClient,
    private applePayResultHandlerService: ApplePayResultHandlerService,
  ) {}

  getName(): string {
    return ApplePayPaymentMethodName;
  }

  init(config: IConfig): Observable<void> {
    this.config = config;
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

  start(): Observable<IPaymentResult<IRequestTypeResponse>> {
    this.frameQueryingService.whenReceive(
      PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT_2,
    (event: IMessageBusEvent<IApplePayValidateMerchantRequest>) => this.validateMerchant(event.data),
    );

    this.frameQueryingService.whenReceive(
      PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION_2,
    (event: IMessageBusEvent<IApplePayGatewayRequest>) => this.authorizePayment(event.data, this.config.applePay.merchantUrl),
    );

    return this.paymentResult.asObservable();
  }

  private validateMerchant(request: IApplePayValidateMerchantRequest): Observable<IApplePayWalletVerifyResponseBody> {
    return this.gatewayClient.walletVerify(request).pipe(
      tap((response: IRequestTypeResponse) => this.applePayResultHandlerService.handleWalletVerifyResult(response, this.paymentResult)),
      catchError((error: Error) => {
        this.applePayResultHandlerService.handleWalletVerifyError(error, this.paymentResult);
        return throwError(() => error);
      }),
    );
  }

  private authorizePayment(request: IApplePayGatewayRequest, merchantUrl: string): Observable<IApplePayProcessPaymentResponse> {
    return this.requestProcessingService.pipe(
      switchMap(requestProcessingService => {
        return requestProcessingService.process(request, merchantUrl) as Observable<IApplePayProcessPaymentResponse>;
      }),
      tap((response: IRequestTypeResponse) => this.applePayResultHandlerService.handlePaymentResult(response, this.paymentResult)),
      catchError((error: Error) => {
        this.applePayResultHandlerService.handlePaymentError(error, this.paymentResult)
        return throwError(() => error);
      }),
    );
  }
}
