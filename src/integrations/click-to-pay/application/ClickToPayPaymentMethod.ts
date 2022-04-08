import { forkJoin, Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { catchError, map, mapTo } from 'rxjs/operators';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { ClickToPayPaymentMethodName } from '../models/ClickToPayPaymentMethodName';
import { IClickToPayConfig } from '../models/IClickToPayConfig';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { DcfActionCode, ICheckoutResponse } from '../digital-terminal/ISrc';

@Service({ id: PaymentMethodToken, multiple: true })
export class ClickToPayPaymentMethod implements IPaymentMethod<IClickToPayConfig> {
  private requestProcessingService: Observable<IRequestProcessingService>;

  constructor(
    private frameQueryingService: IFrameQueryingService,
    private requestProcessingInitializer: RequestProcessingInitializer
  ) {}

  getName(): string {
    return ClickToPayPaymentMethodName;
  }

  init(config: IClickToPayConfig): Observable<undefined> {
    this.requestProcessingService = this.requestProcessingInitializer.initialize();

    const clientInitEvent: IMessageBusEvent<IClickToPayConfig> = {
      type: PUBLIC_EVENTS.CLICK_TO_PAY_INIT,
      data: config,
    };

    return forkJoin([
      this.requestProcessingService,
      this.frameQueryingService.query(clientInitEvent, MERCHANT_PARENT_FRAME),
    ]).pipe(mapTo(undefined));
  }

  start(): Observable<IPaymentResult<ICheckoutResponse>> {
    return this.frameQueryingService
      .query<ICheckoutResponse>({ type: PUBLIC_EVENTS.CLICK_TO_PAY_CHECKOUT }, MERCHANT_PARENT_FRAME)
      .pipe(
        map((checkoutResponse: ICheckoutResponse) => ({
          data: checkoutResponse,
          paymentMethodName: this.getName(),
          error: null,
          status: this.getPaymentStatus(checkoutResponse.dcfActionCode),
        })),
        catchError(error =>
          of({
            status: PaymentStatus.ERROR,
            error: {
              code: error.error.reason,
              message: error.error.message,
            },
            paymentMethodName: this.getName(),
          })
        )
      );
  }

  private getPaymentStatus(dcfActionCode: DcfActionCode): PaymentStatus {
    switch (dcfActionCode) {
      case 'CANCEL':
        return PaymentStatus.CANCEL;
      case 'COMPLETE':
        return PaymentStatus.SUCCESS;
      case 'ERROR':
        return PaymentStatus.ERROR;
      default:
        return PaymentStatus.FAILURE;
    }
  }
}
