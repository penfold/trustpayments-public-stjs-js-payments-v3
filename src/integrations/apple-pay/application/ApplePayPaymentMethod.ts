import { forkJoin, from, merge, Observable, of, Subject, throwError } from 'rxjs';
import { Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { ApplePayPaymentMethodName } from '../models/IApplePayPaymentMethod';
import { IApplePayGatewayRequest } from '../models/IApplePayRequest';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { IApplePayConfig } from '../../../application/core/integrations/apple-pay/IApplePayConfig';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IApplePayValidateMerchantRequest } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { IApplePayWalletVerifyResponseBody } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';
import { IGatewayClient } from '../../../application/core/services/gateway-client/IGatewayClient';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { catchError, mapTo, tap } from 'rxjs/operators';

@Service({ id: PaymentMethodToken, multiple: true })
export class ApplePayPaymentMethod implements IPaymentMethod<IApplePayConfig, IApplePayGatewayRequest, IRequestTypeResponse> {
  private requestProcessingService: Observable<IRequestProcessingService>;
  private paymentErrors: Subject<IPaymentResult<IRequestTypeResponse>>;

  constructor(
    private requestProcessingInitializer: RequestProcessingInitializer,
    private interFrameCommunicator: InterFrameCommunicator,
    private gatewayClient: IGatewayClient,
    private configProvider: ConfigProvider,
  ) {}

  getName(): string {
    return ApplePayPaymentMethodName;
  }

  init(): Observable<void> {
    this.requestProcessingService = this.requestProcessingInitializer.initialize();

    const initClientQueryEvent: IMessageBusEvent = {
      type: PUBLIC_EVENTS.APPLE_PAY_INIT_CLIENT,
      data: this.configProvider.getConfig(),
    };

    return forkJoin([
      this.requestProcessingService,
      from(this.interFrameCommunicator.query(initClientQueryEvent, MERCHANT_PARENT_FRAME)),
    ]).pipe(mapTo(undefined));
  }

  start(): Observable<IPaymentResult<IRequestTypeResponse>> {
    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT_2)
      .thenRespond((event: IMessageBusEvent<IApplePayValidateMerchantRequest>) => this.validateMerchant(event.data));

    const success = of({ status: PaymentStatus.SUCCESS });

    return merge(success, this.paymentErrors);
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
