import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../../shared/model/config/IConfig';
import { GooglePayPaymentService } from './GooglePayPaymentService';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import {
  IGooglePayPaymentRequest,
  IGooglePlayIsReadyToPayRequest,
  IPaymentData
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

    this.insertGooglePayLibrary().then(() => {
      this.onGooglePayLoaded();
    });

    // tslint:disable-next-line:no-shadowed-variable
    this.configProvider.getConfig$().subscribe((config: IConfig) => {
      this.config = config;
      this.onConfigUpdate();
    });
  }

  private onConfigUpdate(): void {
    console.log('update');
  }

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
    const { apiVersion, apiVersionMinor, allowedPaymentMethods } = this.config.googlePay.paymentRequest;

    return Object.assign(
      {},
      {
        apiVersion,
        apiVersionMinor,
        allowedPaymentMethods: [
          {
            type: allowedPaymentMethods.type,
            parameters: {
              allowedAuthMethods: allowedPaymentMethods.parameters.allowedCardAuthMethods,
              allowedCardNetworks: allowedPaymentMethods.parameters.allowedCardNetworks
            }
          }
        ]
      }
    );
  }

  private addGooglePayButton(): void {
    const { buttonRootNode, buttonColor, buttonType, buttonLocale } = this.config.googlePay.buttonOptions;

    const paymentsClient = this.getGooglePaymentsClient();
    const button = paymentsClient.createButton({
      buttonColor,
      buttonType,
      buttonLocale,
      onClick: this.onGooglePaymentButtonClicked
    });

    document.getElementById(buttonRootNode).appendChild(button);
  }

  private getGooglePaymentsClient(): any {
    if (this.googlePayClient === null) {
      this.googlePayClient = new (window as any).google.payments.api.PaymentsClient({ environment: 'TEST' });
    }
    return this.googlePayClient;
  }

  private getGooglePaymentDataRequest(): IGooglePayPaymentRequest {
    const { apiVersion, apiVersionMinor, allowedPaymentMethods, merchantInfo, transactionInfo: { countryCode, currencyCode, totalPriceStatus, totalPrice } } = this.config.googlePay.paymentRequest;

    const paymentDataRequest = Object.assign(
      {},
      {
        apiVersion,
        apiVersionMinor,
        allowedPaymentMethods: [
          {
            type: allowedPaymentMethods.type,
            parameters: {
              allowedAuthMethods: allowedPaymentMethods.parameters.allowedCardAuthMethods,
              allowedCardNetworks: allowedPaymentMethods.parameters.allowedCardNetworks
            },
            tokenizationSpecification: {
              type: allowedPaymentMethods.tokenizationSpecification.type,
              parameters: {
                gateway: allowedPaymentMethods.tokenizationSpecification.parameters.gateway,
                gatewayMerchantId: allowedPaymentMethods.tokenizationSpecification.parameters.gatewayMerchantId
              }
            }
          }
        ],
        transactionInfo: {
          countryCode,
          currencyCode,
          totalPriceStatus,
          totalPrice
        },
        merchantInfo: {
          merchantName: merchantInfo.merchantName,
          merchantId: merchantInfo.merchantId
        }
      }
    );
    return paymentDataRequest;
  }

  private onGooglePaymentButtonClicked = (): void => {
    const paymentDataRequest = this.getGooglePaymentDataRequest();
    const paymentsClient = this.getGooglePaymentsClient();

    if (paymentsClient) {
      paymentsClient
        .loadPaymentData(paymentDataRequest)
        .then((paymentData: IPaymentData) => {
          this.onPaymentAuthorized(paymentData);
        })
        .catch((err: any) => {
          this.onPaymentError();
        });
    }
  };

  private onPaymentAuthorized(paymentData: IPaymentData): void {
    const formData = DomMethods.parseForm(this.config.formId);
    const config = this.config;

    return this.googlePayPaymentService.processPayment(
      this.jwtDecoder.decode(config.jwt).payload.requesttypedescriptions,
      formData,
      paymentData
    );
  }

  private onPaymentError(): void {
    return this.googlePayPaymentService.errorPayment();
  }
}
