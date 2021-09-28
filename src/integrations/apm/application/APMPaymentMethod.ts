import { Observable, of } from 'rxjs';
import { Inject, Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { IConfig } from '../../../shared/model/config/IConfig';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IGatewayClient } from '../../../application/core/services/gateway-client/IGatewayClient';
import { TransportServiceGatewayClient } from '../../../application/core/services/gateway-client/TransportServiceGatewayClient';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { APMPaymentMethodName } from '../models/IAPMPaymentMethod';

@Service({ id: PaymentMethodToken, multiple: true })
export class APMPaymentMethod implements IPaymentMethod<IConfig, any, IRequestTypeResponse> {
  private requestProcessingService: Observable<IRequestProcessingService>;

  constructor(
    private requestProcessingInitializer: RequestProcessingInitializer,
    private frameQueryingService: IFrameQueryingService,
    @Inject(() => TransportServiceGatewayClient) private gatewayClient: IGatewayClient,
    private apmResponseHandlerService: null,
  ) {}

  getName(): string {
    return APMPaymentMethodName;
  }

  init(config: IConfig): Observable<void> {
    return of(null);
  }

  start(config: any): Observable<IPaymentResult<IRequestTypeResponse>> {
    return of(null);
  }

}
