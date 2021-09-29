import { Service } from "typedi";
import { PUBLIC_EVENTS } from "../../../application/core/models/constants/EventTypes";
import { CONTROL_FRAME_IFRAME } from "../../../application/core/models/constants/Selectors";
import { IMessageBusEvent } from "../../../application/core/models/IMessageBusEvent";
import { IPaymentResult } from "../../../application/core/services/payments/IPaymentResult";
import { PaymentResultHandler } from "../../../application/core/services/payments/PaymentResultHandler";
import { PaymentStatus } from "../../../application/core/services/payments/PaymentStatus";
import { IApplePaySession } from "../../../client/integrations/apple-pay/apple-pay-session-service/IApplePaySession";
import { IFrameQueryingService } from "../../../shared/services/message-bus/interfaces/IFrameQueryingService";


@Service()
export class ApplePayCancelPaymentService {
  constructor(
    private frameQueryingService: IFrameQueryingService,
    private paymentResultHandler: PaymentResultHandler,
  ) {}

  init(applePaySession: IApplePaySession): void {
    applePaySession.oncancel = () => {
      const cancelQueryEvent: IMessageBusEvent<unknown> = {
        type: PUBLIC_EVENTS.APPLE_PAY_CANCELLED,
        data: undefined
      };

      this.frameQueryingService.query(cancelQueryEvent, CONTROL_FRAME_IFRAME).subscribe({
        error: (err) => {
          const result: IPaymentResult<unknown> = {
            status: PaymentStatus.CANCEL,
            data: err,
            error: {
              code: 50003,
              message: err.message,
            },
            paymentMethodName: 'APPLEPAY'
          };

          this.paymentResultHandler.handle(result);
        },
      });
    };
  }
}
