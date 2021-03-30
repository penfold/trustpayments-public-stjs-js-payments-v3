import { Service } from 'typedi';
import { environment } from '../../../environments/environment';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../../shared/model/config/IConfig';
import { GooglePayPaymentService } from './GooglePayPaymentService';
import { tap } from 'rxjs/operators';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import {
  IGooglePayTransactionInfo,
  IGooglePayPaymentRequest,
  IGooglePlayIsReadyToPayRequest
} from '../../../integrations/google-pay/models/IGooglePayPaymentRequest';

@Service()
export class GooglePay {
  private SCRIPT_ADDRESS = environment.GOOGLE_PAY.GOOGLE_PAY_URL;
  private SCRIPT_TARGET: string = 'head';

  private googlePayClient: any = null;
  private config: IConfig;

  constructor(
    private configProvider: ConfigProvider,
    private googlePayPaymentService: GooglePayPaymentService,
    private jwtDecoder: JwtDecoder
  ) {}

  public async init(config: IConfig) {
    this.config = config;

    try {
      await this.insertGooglePayLibrary();
      await this.onGooglePayLoaded();

      this.configProvider.getConfig$().subscribe((config: IConfig) => {
        this.config = config;
        this.onConfigUpdate();
      });
    } catch (err) {
      console.error(err);
    }
  }

  private onConfigUpdate(): void {}

  private insertGooglePayLibrary(): Promise<Element> {
    return DomMethods.insertScript(this.SCRIPT_TARGET, { src: this.SCRIPT_ADDRESS });
  }

  private onGooglePayLoaded(): void {
    const paymentsClient = this.getGooglePaymentsClient();

    paymentsClient.isReadyToPay(this.getGoogleIsReadyToPayRequest()).then((response: any) => {
      if (response.result) {
        this.addGooglePayButton();
      }
    });
  }

  private getGoogleIsReadyToPayRequest(): IGooglePlayIsReadyToPayRequest {
    return Object.assign(
      {},
      {
        apiVersion: this.config.googlePay.paymentRequest.apiVersion,
        apiVersionMinor: this.config.googlePay.paymentRequest.apiVersionMinor,
        allowedPaymentMethods: this.config.googlePay.paymentRequest.allowedPaymentMethods
      }
    );
  }

  private addGooglePayButton() {
    const paymentsClient = this.getGooglePaymentsClient();
    const button = paymentsClient.createButton({ onClick: this.onGooglePaymentButtonClicked });

    document.getElementById(this.config.googlePay.buttonOptions.buttonRootNode).appendChild(button);
  }

  private getGooglePaymentsClient() {
    if (this.googlePayClient === null) {
      this.googlePayClient = new (window as any).google.payments.api.PaymentsClient({ environment: 'TEST' });
    }
    return this.googlePayClient;
  }

  private getGooglePaymentDataRequest(): IGooglePayPaymentRequest {
    return Object.assign({}, this.config.googlePay.paymentRequest);
  }

  private onGooglePaymentButtonClicked = () => {
    const paymentDataRequest = this.getGooglePaymentDataRequest();
    const paymentsClient = this.getGooglePaymentsClient();

    if (paymentsClient) {
      paymentsClient
        .loadPaymentData(paymentDataRequest)
        .then((paymentData: any) => {
          this.processPayment(paymentData);
          this.config.googlePay.buttonOptions.onClick();
        })
        .catch((err: any) => {
          console.error(err);
        });
    }
  };

  private processPayment(paymentData: any) {
    this.onPaymentAuthorized(paymentData);
  }

  private onPaymentAuthorized(paymentToken: any): any {
    const formData = DomMethods.parseForm(this.config.formId);
    const config = this.config;

    return this.googlePayPaymentService
      .processPayment(this.jwtDecoder.decode(config.jwt).payload.requesttypedescriptions, formData, paymentToken)
      .pipe(
        tap((response: any) => {
          console.log(response);
        })
      );
  }
}
