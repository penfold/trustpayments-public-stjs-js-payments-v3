import { Service } from 'typedi';
import { environment } from '../../../environments/environment';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../../shared/model/config/IConfig';
import { GooglePayPaymentService } from './GooglePayPaymentService';
import { tap } from 'rxjs/operators';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';

@Service()
export class GooglePay {
  private SCRIPT_ADDRESS = environment.GOOGLE_PAY.GOOGLE_PAY_URL;
  private DOM_TARGET: string = 'st-google-pay';
  private SCRIPT_TARGET: string = 'head';
  private baseRequest: any = {
    apiVersion: 2,
    apiVersionMinor: 0
  };
  private tokenizationSpecification: any = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: 'example',
      gatewayMerchantId: 'exampleGatewayMerchantId'
    }
  };
  private allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
  private allowedCardNetworks = ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'];
  private baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
      allowedAuthMethods: this.allowedCardAuthMethods,
      allowedCardNetworks: this.allowedCardNetworks
    }
  };
  private cardPaymentMethod = Object.assign(
    { tokenizationSpecification: this.tokenizationSpecification },
    this.baseCardPaymentMethod
  );
  private googlePayClient: any = null;
  private config: any;

  constructor(
    configProvider: ConfigProvider,
    private googlePayPaymentService: GooglePayPaymentService,
    private jwtDecoder: JwtDecoder
  ) {
    this.init();
    configProvider.getConfig$().subscribe((config: IConfig) => {
      this.config = config;
    });
  }

  private init() {
    this.insertGooglePayLibrary().then(() => {
      this.onGooglePayLoaded();
    });
  }

  private insertGooglePayLibrary(): Promise<Element> {
    return DomMethods.insertScript(this.SCRIPT_TARGET, { src: this.SCRIPT_ADDRESS });
  }

  private onGooglePayLoaded() {
    const paymentsClient = this.getGooglePaymentsClient();
    paymentsClient
      .isReadyToPay(this.getGoogleIsReadyToPayRequest())
      .then((response: any) => {
        if (response.result) {
          this.addGooglePayButton();
        }
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  private getGoogleIsReadyToPayRequest() {
    return Object.assign({}, this.baseRequest, {
      allowedPaymentMethods: [this.baseCardPaymentMethod]
    });
  }

  private addGooglePayButton() {
    const paymentsClient = this.getGooglePaymentsClient();
    const button = paymentsClient.createButton({ onClick: this.onGooglePaymentButtonClicked });
    document.getElementById(this.DOM_TARGET).appendChild(button);
  }

  private getGooglePaymentsClient() {
    if (this.googlePayClient === null) {
      this.googlePayClient = new (window as any).google.payments.api.PaymentsClient({ environment: 'TEST' });
    }
    return this.googlePayClient;
  }

  private getGooglePaymentDataRequest() {
    const paymentDataRequest = Object.assign({}, this.baseRequest);
    paymentDataRequest.allowedPaymentMethods = [this.cardPaymentMethod];
    paymentDataRequest.transactionInfo = this.getGoogleTransactionInfo();
    paymentDataRequest.merchantInfo = {
      merchantName: 'Example Merchant',
      merchantId: '12345678901234567890'
    };
    return paymentDataRequest;
  }

  private getGoogleTransactionInfo() {
    return {
      countryCode: 'US',
      currencyCode: 'USD',
      totalPriceStatus: 'FINAL',
      totalPrice: '1.00'
    };
  }

  private onGooglePaymentButtonClicked = () => {
    const paymentDataRequest = this.getGooglePaymentDataRequest();
    paymentDataRequest.transactionInfo = this.getGoogleTransactionInfo();
    const paymentsClient = this.getGooglePaymentsClient();

    if (paymentsClient) {
      paymentsClient
        .loadPaymentData(paymentDataRequest)
        .then((paymentData: any) => {
          this.processPayment(paymentData);
        })
        .catch((err: any) => {
          console.error(err);
        });
    }
  };

  private processPayment(paymentData: any) {
    this.onPaymentAuthorized(paymentData.paymentMethodData.tokenizationData.token);
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

  // TO PREFETCH DATA
  // private prefetchGooglePaymentData() {
  //   const paymentDataRequest = this.getGooglePaymentDataRequest();
  //   paymentDataRequest.transactionInfo = {
  //     totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
  //     currencyCode: 'USD'
  //   };
  //   const paymentsClient = this.getGooglePaymentsClient();
  //   paymentsClient.prefetchPaymentData(paymentDataRequest);
  // }
}
