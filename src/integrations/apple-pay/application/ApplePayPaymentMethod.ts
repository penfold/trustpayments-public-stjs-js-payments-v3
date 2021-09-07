import { forkJoin, from, Observable, of, mapTo } from 'rxjs';
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
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';

@Service({ id: PaymentMethodToken, multiple: true })
export class ApplePayPaymentMethod implements IPaymentMethod<IApplePayConfig, IApplePayGatewayRequest, IRequestTypeResponse> {
  private requestProcessingService: Observable<IRequestProcessingService>;

  constructor(
    private requestProcessingInitializer: RequestProcessingInitializer,
    private interFrameCommunicator: InterFrameCommunicator,
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

  start(request: IApplePayGatewayRequest): Observable<IPaymentResult<IRequestTypeResponse>> {
    return of({
      status: PaymentStatus.ERROR,
      data: {},
      error: {
        code: 123,
        message: 'error',
      },
    });
  }
}
