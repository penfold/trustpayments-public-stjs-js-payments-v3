import { mapTo } from 'rxjs/operators';
import { forkJoin, NEVER, Observable, of, switchMap } from 'rxjs';
import { Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { APMPaymentMethodName } from '../models/IAPMPaymentMethod';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IAPMConfig } from '../models/IAPMConfig';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IAPMGatewayResponse } from '../models/IAPMGatewayResponse';
import { IAPMItemConfig } from '../models/IAPMItemConfig';
import { APMRequestPayloadFactory } from '../services/apm-request-payload-factory/APMRequestPayloadFactory';
import { EventScope } from '../../../application/core/models/constants/EventScope';
import { APMRequestProcessingService } from '../../../application/core/services/request-processor/processing-services/APMRequestProcessingService';

@Service({ id: PaymentMethodToken, multiple: true })
export class APMPaymentMethod implements IPaymentMethod<IAPMConfig, any, IRequestTypeResponse> {

  constructor(
    private frameQueryingService: IFrameQueryingService,
    private requestProcessingService: APMRequestProcessingService,
    private messageBus: IMessageBus,
    private apmRequestPayloadFactory: APMRequestPayloadFactory
  ) {
  }

  getName(): string {
    return APMPaymentMethodName;
  }

  init(config: IAPMConfig): Observable<void> {
    const initClientQueryEvent: IMessageBusEvent = {
      type: PUBLIC_EVENTS.APM_INIT_CLIENT,
      data: config,
    };

    return forkJoin([
      this.requestProcessingService.init(null),
      this.frameQueryingService.query(initClientQueryEvent, MERCHANT_PARENT_FRAME),
    ]).pipe(mapTo(undefined));
  }

  start(apmConfig: IAPMItemConfig): Observable<IPaymentResult<IAPMGatewayResponse>> {
    const request = this.apmRequestPayloadFactory.create(apmConfig);

    return this.requestProcessingService.process(request).pipe(
      switchMap((response: IAPMGatewayResponse) => {
        if (Number(response.errorcode) !== 0) {
          return of({
            paymentMethodName: APMPaymentMethodName,
            status: PaymentStatus.FAILURE,
            data: response,
            error: {
              code: Number(response.errorcode),
              message: response.errormessage,
            },
          });
        }

        this.messageBus.publish(
          {
            type: PUBLIC_EVENTS.APM_REDIRECT,
            data: response.redirecturl,
          },
          EventScope.ALL_FRAMES,
        );

        return NEVER;
      })
    );
  }
}
