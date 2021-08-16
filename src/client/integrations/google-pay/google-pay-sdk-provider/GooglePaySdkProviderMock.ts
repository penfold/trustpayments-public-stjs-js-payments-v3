import HttpClient from '@trustpayments/http-client';
import * as Http from 'http';
import { asapScheduler, firstValueFrom, Observable, scheduled, throwError } from 'rxjs';
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

  private loadPaymentData(request: IGooglePayPaymentRequest):Promise<IPaymentResponse>{
    return firstValueFrom(this.httpClient.get$<IPaymentResponse>(this.mockPaymentUrl)
      .pipe(
        map((response) => {
          if(Object.prototype.hasOwnProperty.call(response, 'error')) {
            return Promise.reject(response) as unknown as IPaymentResponse;
          }
          return response.data;
        })
      ));
  }

  private createButton(config: IGooglePayButtonOptions) {
    const button = document.createElement('button');
    button.id = 'gp-mocked-button';
    button.innerHTML = '<img src="./img/google-pay-button.svg" alt="Buy with Google Pay" style="max-width:100%;">';
    button.setAttribute('style', `
      appearance: none;
      background: transparent;
      padding: 0;
      border: 0;
      outline: none;
      cursor: pointer;
    `);
    button.setAttribute('type', 'button');
    button.addEventListener('click', event => {
      event.preventDefault();
      config.onClick();
    });

    return button;
  }
}
