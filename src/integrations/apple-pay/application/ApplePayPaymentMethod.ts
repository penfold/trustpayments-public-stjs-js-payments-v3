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
import { catchError, tap } from 'rxjs/operators';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';

@Service({ id: PaymentMethodToken, multiple: true })
export class ApplePayPaymentMethod implements IPaymentMethod<IConfig, undefined, IRequestTypeResponse> {
  private requestProcessingService: Observable<IRequestProcessingService>;
  private paymentErrors: Subject<IPaymentResult<IRequestTypeResponse>> = new Subject();

  constructor(
    private requestProcessingInitializer: RequestProcessingInitializer,
    private frameQueryingService: IFrameQueryingService,
    @Inject(() => TransportServiceGatewayClient) private gatewayClient: IGatewayClient,
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

  start(): Observable<IPaymentResult<IRequestTypeResponse>> {
    this.frameQueryingService.whenReceive(
      PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT_2,
    (event: IMessageBusEvent<IApplePayValidateMerchantRequest>) => this.validateMerchant(event.data),
    );

    this.frameQueryingService.whenReceive(PUBLIC_EVENTS.APPLE_PAY_CANCELLED, () => this.paymentCancelled());

    const success = of({ status: PaymentStatus.SUCCESS });

    return merge(NEVER, this.paymentErrors);
  }

  private paymentCancelled() {
    const err = new Error('Payment has been cancelled');

    this.paymentErrors.error({
      status: PaymentStatus.CANCEL,
      data: err,
      error: {
        code: 50003,
        message: err.message,
      },
    });

    return throwError(() => err);
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
}
