import { Service } from 'typedi';
import { environment } from '../../../../../environments/environment';
import { DomMethods } from '../../../shared/dom-methods/DomMethods';
import { VisaCheckout } from '../VisaCheckout';
import { VisaCheckoutButtonProps } from '../visa-checkout-button-service/VisaCheckoutButtonProps';

@Service()
export class VisaCheckoutMockClass extends VisaCheckout {
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
      // this.onSuccess(payment);
    } else if (status === 'ERROR') {
      // this.onError();
    } else if (status === 'WARNING') {
      // this.onCancel();
    }
  }
}