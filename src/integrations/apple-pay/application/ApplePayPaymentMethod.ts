import { forkJoin, Observable, of, mapTo, merge, Subject, throwError, NEVER } from 'rxjs';
import { Inject, Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { ApplePayPaymentMethodName } from '../models/IApplePayPaymentMethod';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
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
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IApplePayPaymentAuthorizationResult } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizationResult ';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';

@Service({ id: PaymentMethodToken, multiple: true })
export class ApplePayPaymentMethod implements IPaymentMethod<IConfig, undefined, IRequestTypeResponse> {
  private requestProcessingService: Observable<IRequestProcessingService>;
  private paymentErrors: Subject<IPaymentResult<IRequestTypeResponse>> = new Subject();
  private config: IConfig;

  constructor(
    private requestProcessingInitializer: RequestProcessingInitializer,
    private frameQueryingService: IFrameQueryingService,
    @Inject(() => TransportServiceGatewayClient) private gatewayClient: IGatewayClient,
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

    // handle the query - send request to the gateway
    this.frameQueryingService.whenReceive(
      PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION_2,
    (event: IMessageBusEvent<IStartPaymentMethod<IApplePayGatewayRequest>>) => this.authorizePayment(event.data),
    );

    const success = of({ status: PaymentStatus.SUCCESS });

    return merge(NEVER, this.paymentErrors);
  }

  private validateMerchant(request: IApplePayValidateMerchantRequest): Observable<IApplePayWalletVerifyResponseBody> {
    return this.gatewayClient.walletVerify(request).pipe(
      tap(response => {
        if (Number(response.errorcode) !== 0) {
          this.paymentErrors.next({
            status: PaymentStatus.FAILURE,
            data: response,
            error: {
              code: Number(response.errorcode),
              message: response.errormessage,
            },
          });
        }
      }),
      catchError((error: Error) => {
        this.paymentErrors.error({
          status: PaymentStatus.ERROR,
          data: error,
          error: {
            code: 50003,
            message: error.message,
          },
        });

        return throwError(() => error);
      }),
    );
  }

  private authorizePayment(request: IApplePayGatewayRequest): Observable<IPaymentResult<IRequestTypeResponse>> {
    return this.requestProcessingService.pipe(
      switchMap(requestProcessingService => {
        const merchantUrl = this.config.applePay.merchantUrl;

        return requestProcessingService.process(request, merchantUrl);
      }),
      map(response => console.log(response)),
      catchError(response => of(console.log(response)))
    );
  }
}
