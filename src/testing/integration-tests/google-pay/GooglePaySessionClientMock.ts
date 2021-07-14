import { Service } from 'typedi';
import { paymentResponseMock } from '../../../client/integrations/google-pay/google-pay-sdk-provider/GooglePaySdkPaymentsClientMock';
import { IGooglePaySessionPaymentsClient, IGooglePayButtonOptions } from '../../../integrations/google-pay/models/IGooglePayPaymentsClient';
import { IPaymentResponse } from '../../../integrations/google-pay/models/IGooglePayPaymentRequest';

Service();
export class GooglePaySessionPaymentsClientMock implements IGooglePaySessionPaymentsClient {
  private scenario: 'success' | 'error';

  mockPaymentData(scenario: 'success' | 'error'): void {
    this.scenario = scenario;
  }

  isReadyToPay = (): Promise<{ result: boolean; }> => {
    return Promise.resolve({ result: true });
  };

  loadPaymentData = (): Promise<IPaymentResponse> => {
    if (this.scenario === 'success') {
      return Promise.resolve(paymentResponseMock);
    } else {
      return Promise.reject({ error: { statusCode: 'ERROR' } });
    }
  };

  createButton(config: IGooglePayButtonOptions): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = 'gp-mocked-button';
    button.addEventListener('click', event => {
      event.preventDefault();
      config.onClick();
    });

    return button;
  }
}
