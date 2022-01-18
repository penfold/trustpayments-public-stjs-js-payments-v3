import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { ClickToPayPaymentMethodName } from '../models/ClickToPayPaymentMethodName';
import { IClickToPayConfig } from '../models/IClickToPayConfig';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';

@Service({ id: PaymentMethodToken, multiple: true })
export class ClickToPayPaymentMethod implements IPaymentMethod<IClickToPayConfig> {
  constructor(private frameQueryingService: IFrameQueryingService) {
  }

  getName(): string {
    return ClickToPayPaymentMethodName;
  }

  init(config: IClickToPayConfig): Observable<undefined> {
    const clientInitEvent: IMessageBusEvent<IClickToPayConfig> = {
      type: PUBLIC_EVENTS.CLICK_TO_PAY_INIT_CLIENT,
      data: config,
    };
    return this.frameQueryingService.query(clientInitEvent, MERCHANT_PARENT_FRAME);
  }

  start(data: unknown): Observable<IPaymentResult<unknown>> {
    return of({ status: PaymentStatus.SUCCESS, paymentMethodName: ClickToPayPaymentMethodName } );
  }
}
