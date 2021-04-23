import { from, Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { Service } from 'typedi';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { environment } from '../../../../environments/environment';
import { GooglePlayProductionEnvironment, GooglePlayTestEnvironment } from '../../../../integrations/google-pay/models/IGooglePayConfig';
import { IGooglePlayIsReadyToPayRequest } from '../../../../integrations/google-pay/models/IGooglePayPaymentRequest';
import { IGooglePaySessionPaymentsClient } from '../../../../integrations/google-pay/models/IGooglePayPaymentsClient';
import { IConfig } from '../../../../shared/model/config/IConfig';

@Service()
export class GooglePaySdkProvider {
  private readonly SCRIPT_ADDRESS = environment.GOOGLE_PAY.GOOGLE_PAY_URL;
  private readonly SCRIPT_TARGET: string = 'head';

  setupSdk$(config: IConfig): Observable<IGooglePaySessionPaymentsClient> {
    let googlePaySdkInstance: IGooglePaySessionPaymentsClient;

    return this.insertGooglePayLibrary().pipe(
      map(() => {
        googlePaySdkInstance = this.getGooglePaySdkInstance()

        return googlePaySdkInstance;
      }),
      switchMap((googlePaySdk: IGooglePaySessionPaymentsClient) => {
        return from(googlePaySdk.isReadyToPay(this.getGoogleIsReadyToPayRequest(config)));
      }),
      filter((isReadyToPayResponse: any) => isReadyToPayResponse.result),
      switchMap(() => of(googlePaySdkInstance)),
    )
  }

  private insertGooglePayLibrary(): Observable<Element> {
    return from(DomMethods.insertScript(this.SCRIPT_TARGET, { src: this.SCRIPT_ADDRESS }));
  }

  private getGooglePayEnvironment(): string {
    return environment.production ? GooglePlayProductionEnvironment : GooglePlayTestEnvironment;
  }

  private getGooglePaySdkInstance(): IGooglePaySessionPaymentsClient {
    return (new (window as any).google.payments.api.PaymentsClient({
      environment: this.getGooglePayEnvironment(),
    }));
  }

  private getGoogleIsReadyToPayRequest(config: IConfig): IGooglePlayIsReadyToPayRequest {
    const { apiVersion, apiVersionMinor, allowedPaymentMethods } = config.googlePay.paymentRequest;

    return {
      apiVersion,
      apiVersionMinor,
      allowedPaymentMethods: [
        {
          type: allowedPaymentMethods.type,
          parameters: {
            allowedAuthMethods: allowedPaymentMethods.parameters.allowedCardAuthMethods,
            allowedCardNetworks: allowedPaymentMethods.parameters.allowedCardNetworks,
          },
        },
      ],
    };
  }
}
