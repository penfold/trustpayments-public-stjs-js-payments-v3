import { Service } from 'typedi';
import { paymentResponseMock } from '../../../client/integrations/google-pay/google-pay-sdk-provider/GooglePaySdkPaymentsClientMock';
import { IGooglePaySessionPaymentsClient, IGooglePayButtonOptions } from '../../../integrations/google-pay/models/IGooglePayPaymentsClient';

Service();
export class GooglePaySessionPaymentsClientMock implements IGooglePaySessionPaymentsClient {
  private scenario: 'success' | 'error';

  mockPaymentData(scenario: 'success' | 'error') {
    this.scenario = scenario;
  }

  isReadyToPay = (): Promise<any> => {
    return Promise.resolve({ result: true });
  };

  loadPaymentData = (): Promise<any> => {
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
