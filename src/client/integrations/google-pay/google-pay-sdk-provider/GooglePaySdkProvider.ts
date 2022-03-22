import { from, Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { Service } from 'typedi';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { environment } from '../../../../environments/environment';
import {
  GooglePayProductionEnvironment,
  GooglePayTestEnvironment,
} from '../../../../integrations/google-pay/models/IGooglePayConfig';
import { IGooglePlayIsReadyToPayRequest } from '../../../../integrations/google-pay/models/IGooglePayPaymentRequest';
import {
  IGooglePaySessionPaymentsClient,
  IIsReadyToPayResponse,
} from '../../../../integrations/google-pay/models/IGooglePayPaymentsClient';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { GooglePayCallbacks } from './GooglePayCallbacks';
import { IGooglePaySdkProvider } from './IGooglePaySdkProvider';

@Service()
export class GooglePaySdkProvider implements IGooglePaySdkProvider {
  private readonly SCRIPT_ADDRESS = environment.GOOGLE_PAY.GOOGLE_PAY_URL;
  private readonly SCRIPT_TARGET: string = 'head';

  constructor(private googlePayCallbacks: GooglePayCallbacks) {
    this.googlePayCallbacks.init();
  }

  setupSdk$(config: IConfig): Observable<IGooglePaySessionPaymentsClient> {
    let googlePaySdkInstance: IGooglePaySessionPaymentsClient;

    return this.insertGooglePayLibrary().pipe(
      map(() => {
        googlePaySdkInstance = this.getGooglePaySdkInstance(config);

        return googlePaySdkInstance;
      }),
      switchMap((googlePaySdk: IGooglePaySessionPaymentsClient) => {
        return from(googlePaySdk.isReadyToPay(this.getGoogleIsReadyToPayRequest(config)));
      }),
      filter((isReadyToPayResponse: IIsReadyToPayResponse) => isReadyToPayResponse.result),
      switchMap(() => of(googlePaySdkInstance))
    );
  }

  private insertGooglePayLibrary(): Observable<Element> {
    return DomMethods.insertScript(this.SCRIPT_TARGET, { src: this.SCRIPT_ADDRESS });
  }

  private getGooglePayEnvironment(config: IConfig): string {
    const paymentRequest = config.googlePay.paymentRequest;

    return config.googlePay.paymentRequest.environment ? paymentRequest.environment : environment.production ? GooglePayProductionEnvironment : GooglePayTestEnvironment;
  }

  private getGooglePaySdkInstance(config: IConfig): IGooglePaySessionPaymentsClient {
    return new window.google.payments.api.PaymentsClient({
      environment: this.getGooglePayEnvironment(config),
      paymentDataCallbacks: {
        onPaymentAuthorized: this.googlePayCallbacks.onPaymentAuthorized,
        onPaymentDataChanged: this.googlePayCallbacks.onPaymentDataChanged,
      }
    } as any);
  }

  private getGoogleIsReadyToPayRequest(config: IConfig): IGooglePlayIsReadyToPayRequest {
    const { apiVersion, apiVersionMinor, allowedPaymentMethods } = config.googlePay.paymentRequest;

    return {
      apiVersion,
      apiVersionMinor,
      allowedPaymentMethods,
    };
  }
}
