import { Service } from 'typedi';
import { IApplePayPaymentAuthorizedEvent } from '../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IApplePayGatewayRequest } from '../models/IApplePayRequest';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { CONTROL_FRAME_IFRAME } from '../../../application/core/models/constants/Selectors';
import { IApplePayProcessPaymentResponse } from '../../../application/core/integrations/apple-pay/apple-pay-payment-service/IApplePayProcessPaymentResponse';
import { ApplePayStatus } from '../../../client/integrations/apple-pay/apple-pay-session-service/ApplePayStatus';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { IApplePaySession } from './IApplePaySession';

@Service()
export class PaymentAuthorizationService {
  constructor(
    private frameQueryingService: IFrameQueryingService,
    private googleAnalytics: GoogleAnalytics,
  ) {
  }

  init(applePaySession: IApplePaySession, config: IApplePayConfigObject): void {
    applePaySession.onpaymentauthorized = (event: IApplePayPaymentAuthorizedEvent) => {
      const formData = DomMethods.parseForm(config.formId);

      const paymentAuthorizedQueryEvent: IMessageBusEvent<IApplePayGatewayRequest> = {
        type: PUBLIC_EVENTS.APPLE_PAY_AUTHORIZATION_2,
        data: {
          ...formData,
          walletsource: 'APPLEPAY',
          wallettoken: JSON.stringify(event.payment),
          termurl: 'https://termurl.com',
        },
      };

      // send query to application side
      this.frameQueryingService.query(paymentAuthorizedQueryEvent, CONTROL_FRAME_IFRAME).subscribe({
        next: (response: IApplePayProcessPaymentResponse) => {
          if (Number(response.errorcode) === 0) {
            applePaySession.completePayment({ status: ApplePayStatus.STATUS_SUCCESS });
            this.googleAnalytics.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment completed');
          } else {
            applePaySession.completePayment({ status: ApplePayStatus.STATUS_FAILURE });
            this.googleAnalytics.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment failure');
          }
        },
        error: () => {
          applePaySession.completePayment({ status: ApplePayStatus.STATUS_FAILURE });
          this.googleAnalytics.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment error');
        },
      });
    };
  }
}
