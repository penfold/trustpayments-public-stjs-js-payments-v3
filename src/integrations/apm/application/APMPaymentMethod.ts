import { forkJoin, Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { APMPaymentMethodName } from '../models/IAPMPaymentMethod';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { mapTo } from 'rxjs/operators';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IAPMConfig } from '../models/IAPMConfig';

@Service({ id: PaymentMethodToken, multiple: true })
export class APMPaymentMethod implements IPaymentMethod<IAPMConfig, any, IRequestTypeResponse> {
  private requestProcessingService: Observable<IRequestProcessingService>;

  constructor(
    private frameQueryingService: IFrameQueryingService,
    private requestProcessingInitializer: RequestProcessingInitializer,
  ) {}

  getName(): string {
    return APMPaymentMethodName;
  }

  init(config: IAPMConfig): Observable<void> {
    this.requestProcessingService = this.requestProcessingInitializer.initialize();

    const initClientQueryEvent: IMessageBusEvent = {
      type: PUBLIC_EVENTS.APM_INIT_CLIENT,
      data: config,
    };

    return forkJoin([
      this.requestProcessingService,
      this.frameQueryingService.query(initClientQueryEvent, MERCHANT_PARENT_FRAME),
    ]).pipe(mapTo(undefined));
  }

  start(config: any): Observable<IPaymentResult<IRequestTypeResponse>> {
    return of(null);
  }
}
