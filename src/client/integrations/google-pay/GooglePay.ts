import { Service } from 'typedi';
import { environment } from '../../../environments/environment';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../../shared/model/config/IConfig';
import { GooglePayPaymentService } from './GooglePayPaymentService';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import {
  IGooglePayPaymentRequest,
  IGooglePlayIsReadyToPayRequest,
  IGooglePayTransactionInfo,
  IPaymentData,
} from '../../../integrations/google-pay/models/IGooglePayPaymentRequest';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { takeUntil, tap } from 'rxjs/operators';
import { IStJwtPayload } from '../../../application/core/models/IStJwtPayload';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { Observable } from 'rxjs';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { Money } from 'ts-money';
import {
  GooglePlayProductionEnvironment,
  GooglePlayTestEnvironment,
} from '../../../integrations/google-pay/models/IGooglePayConfig';
@Service()
export class GooglePay {
  private readonly SCRIPT_ADDRESS = environment.GOOGLE_PAY.GOOGLE_PAY_URL;
  private readonly SCRIPT_TARGET: string = 'head';

  private googlePayClient: any = null;
  private config: IConfig;
  private destroy$: Observable<IMessageBusEvent>;

  constructor(
    private configProvider: ConfigProvider,
    private googlePayPaymentService: GooglePayPaymentService,
    private jwtDecoder: JwtDecoder,
    private messageBus: IMessageBus
  ) {
    this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
  }

  public async init(config: IConfig) {
    this.config = config;

    this.insertGooglePayLibrary().then(() => {
      this.onGooglePayLoaded();
    });

    // tslint:disable-next-line:no-shadowed-variable
    this.configProvider
      .getConfig$()
      .pipe(
        tap((config: IConfig): void => {
          this.config = config;
          this.updateJwtListener();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private updateConfigWithJWT(jwt: string): IConfig {
    const { payload }: { payload: IStJwtPayload } = this.jwtDecoder.decode(jwt);

    let totalPrice = payload.mainamount;

    if (totalPrice === undefined) {
      totalPrice = Money.fromInteger({
        amount: parseInt(payload.baseamount, 10),
        currency: payload.currencyiso3a,
      }).toString();
    }

    const transactionInfo: IGooglePayTransactionInfo = {
      ...this.config.googlePay.paymentRequest.transactionInfo,
      currencyCode: payload.currencyiso3a,
      totalPrice,
    };

    return {
      ...this.config,
      googlePay: {
        ...this.config.googlePay,
        paymentRequest: { ...this.config.googlePay.paymentRequest, transactionInfo },
      },
    };
  }

  private updateJwtListener(): void {
    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.UPDATE_JWT),
        tap((event: IMessageBusEvent) => {
          this.updateConfigWithJWT(event.data.newJwt);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
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

  private addGooglePayButton(): void {
    const { buttonRootNode, buttonColor, buttonType, buttonLocale } = this.config.googlePay.buttonOptions;

    const paymentsClient = this.getGooglePaymentsClient();
    const button = paymentsClient.createButton({
      buttonColor,
      buttonType,
      buttonLocale,
      onClick: this.onGooglePaymentButtonClicked,
    });

    document.getElementById(buttonRootNode).appendChild(button);
  }

  private getGooglePaymentsClient(): any {
    console.log('=== environment', environment);
    if (this.googlePayClient === null) {
      this.googlePayClient = new (window as any).google.payments.api.PaymentsClient({
        environment: environment.production ? GooglePlayProductionEnvironment : GooglePlayTestEnvironment,
      });
    }
    return this.googlePayClient;
  }

  private getGooglePaymentDataRequest(): IGooglePayPaymentRequest {
    const {
      apiVersion,
      apiVersionMinor,
      allowedPaymentMethods,
      merchantInfo,
      transactionInfo: { countryCode, currencyCode, totalPriceStatus, totalPrice },
    } = this.config.googlePay.paymentRequest;

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
              allowedCardNetworks: allowedPaymentMethods.parameters.allowedCardNetworks,
            },
            tokenizationSpecification: {
              type: allowedPaymentMethods.tokenizationSpecification.type,
              parameters: {
                gateway: allowedPaymentMethods.tokenizationSpecification.parameters.gateway,
                gatewayMerchantId: allowedPaymentMethods.tokenizationSpecification.parameters.gatewayMerchantId,
              },
            },
          },
        ],
        transactionInfo: {
          countryCode,
          currencyCode,
          totalPriceStatus,
          totalPrice,
        },
        merchantInfo: {
          merchantName: merchantInfo.merchantName,
          merchantId: merchantInfo.merchantId,
        },
      }
    );
    return paymentDataRequest;
  }

  private onGooglePaymentButtonClicked = (): void => {
    const paymentDataRequest = this.getGooglePaymentDataRequest();
    const paymentsClient = this.getGooglePaymentsClient();

    if (paymentsClient) {
      paymentsClient
        .loadPaymentData({ ...paymentDataRequest, transactionInfo: { ...paymentDataRequest.transactionInfo } })
        .then((paymentData: IPaymentData) => {
          this.onPaymentAuthorized(paymentData);
        })
        .catch((err: any) => {
          switch (err.statusCode) {
            case 'CANCELED': {
              this.onPaymentError(PaymentStatus.CANCEL);
              break;
            }
            default: {
              this.onPaymentError(PaymentStatus.ERROR);
              break;
            }
          }
        });
    }
  };

  private onPaymentAuthorized(paymentData: IPaymentData): void {
    const formData = DomMethods.parseForm(this.config.formId);
    const config = this.config;

    return this.googlePayPaymentService.processPayment(
      this.jwtDecoder.decode(config.jwt).payload.requesttypedescriptions,
      formData,
      paymentData,
      PaymentStatus.SUCCESS
    );
  }

  private onPaymentError(errorCode: PaymentStatus): void {
    const formData = DomMethods.parseForm(this.config.formId);
    const config = this.config;

    return this.googlePayPaymentService.errorPayment(
      this.jwtDecoder.decode(config.jwt).payload.requesttypedescriptions,
      formData,
      errorCode
    );
  }
}
