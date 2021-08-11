import HttpClient from '@trustpayments/http-client';
import { asapScheduler, firstValueFrom, Observable, scheduled } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IGooglePayPaymentRequest,
  IGooglePlayIsReadyToPayRequest,
  IPaymentResponse,
} from '../../../../integrations/google-pay/models/IGooglePayPaymentRequest';
import {
  IGooglePayButtonOptions,
  IGooglePaySessionPaymentsClient,
  IIsReadyToPayResponse,
} from '../../../../integrations/google-pay/models/IGooglePayPaymentsClient';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IGooglePaySdkProvider } from './IGooglePaySdkProvider';

export class GooglePaySdkProviderMock implements IGooglePaySdkProvider {
  private mockPaymentUrl: string; // TODO update this when wiremock is implemented in STJS-1931

  constructor(private httpClient: HttpClient) {}

  setupSdk$(config: IConfig): Observable<IGooglePaySessionPaymentsClient> {
    return scheduled([this.getClientMock()], asapScheduler);
  }

  private getClientMock(): IGooglePaySessionPaymentsClient {
    return {
      isReadyToPay(request: IGooglePlayIsReadyToPayRequest): Promise<IIsReadyToPayResponse> {
        return Promise.resolve({ result: true });
      },
      loadPaymentData: this.loadPaymentData,
      createButton: this.createButton,
    };
  }

  private loadPaymentData(request: IGooglePayPaymentRequest): Promise<IPaymentResponse> {
    // TODO update this when wiremock is implemented in STJS-1931
    return firstValueFrom<IPaymentResponse>(
      this.httpClient.get$(this.mockPaymentUrl).pipe(map(response => response.data as IPaymentResponse))
    );
  }

  private createButton(config: IGooglePayButtonOptions) {
    const button = document.createElement('button');
    button.id = 'gp-mocked-button';
    button.addEventListener('click', event => {
      event.preventDefault();
      config.onClick();
    });

    return button;
  }
}
