import HttpClient from '@trustpayments/http-client';
import * as Http from 'http';
import { asapScheduler, firstValueFrom, Observable, scheduled } from 'rxjs';
import { map } from 'rxjs/operators';
import { Container, Service } from 'typedi';
import { environment } from '../../../../environments/environment';
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

@Service()
export class GooglePaySdkProviderMock implements IGooglePaySdkProvider {
  private mockPaymentUrl: string = environment.GOOGLE_PAY.MOCK_DATA_URL;

  constructor(private httpClient: HttpClient) {}

  setupSdk$(config: IConfig): Observable<IGooglePaySessionPaymentsClient> {
    return scheduled([this.getClientMock()], asapScheduler);
  }

  private getClientMock(): IGooglePaySessionPaymentsClient {
    return {
      isReadyToPay(request: IGooglePlayIsReadyToPayRequest): Promise<IIsReadyToPayResponse> {
        return Promise.resolve({ result: true });
      },
      loadPaymentData: this.loadPaymentData.bind(this),
      createButton: this.createButton,
    };
  }

  private loadPaymentData(request: IGooglePayPaymentRequest): Promise<IPaymentResponse> {
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
