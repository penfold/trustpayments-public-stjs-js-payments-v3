import { map } from 'rxjs/operators';
import { Service } from 'typedi';
import { environment } from '../../../../../environments/environment';
import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { ofType } from '../../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';
import { DomMethods } from '../../../shared/dom-methods/DomMethods';
import { VisaCheckout } from '../VisaCheckout';
import { VisaCheckoutButtonProps } from '../visa-checkout-button-service/VisaCheckoutButtonProps';

@Service()
export class VisaCheckoutMockClass {
  constructor(private interFrameCommunicator: InterFrameCommunicator, private visaCheckout: VisaCheckout) {
    this.init();
  }

  private init(): void {
    this.visaCheckout.init();
    this.paymentStatusHandler();
  }

  protected paymentStatusHandler() {
    DomMethods.addListener(VisaCheckoutButtonProps.id, 'click', () => {
      this._handleMockedData();
    });
  }

  private _handleMockedData() {
    return fetch(environment.VISA_CHECKOUT_URLS.MOCK_DATA_URL)
      .then((response: any) => response.json())
      .then(({ payment, status }: any) => {
        this._proceedFlowWithMockedData(payment, status);
      });
  }

  private _proceedFlowWithMockedData(payment: any, status: string) {
    if (status === 'SUCCESS') {
      this.interFrameCommunicator.incomingEvent$
        .pipe(
          ofType(PUBLIC_EVENTS.VISA_CHECKOUT_START),
          map(() => {
            return {
              type: PUBLIC_EVENTS.VISA_CHECKOUT_START,
              data: payment
            };
          })
        )
        .subscribe();
      // this.onSuccess(payment);
    } else if (status === 'ERROR') {
      // error
    } else if (status === 'WARNING') {
      // cancel
    }
  }
}
