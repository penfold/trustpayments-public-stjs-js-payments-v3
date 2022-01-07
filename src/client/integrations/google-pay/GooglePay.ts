import { Service } from 'typedi';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Money } from 'ts-money';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../../shared/model/config/IConfig';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import {
  IGooglePayPaymentRequest,
  IGooglePayTransactionInfo,
  IPaymentData,
} from '../../../integrations/google-pay/models/IGooglePayPaymentRequest';
import { IStJwtPayload } from '../../../application/core/models/IStJwtPayload';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { IGooglePaySessionPaymentsClient } from '../../../integrations/google-pay/models/IGooglePayPaymentsClient';
import { IUpdateJwt } from '../../../application/core/models/IUpdateJwt';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { GooglePayPaymentService } from './GooglePayPaymentService';
import { IGooglePaySdkProvider } from './google-pay-sdk-provider/IGooglePaySdkProvider';

@Service()
export class GooglePay {
  private googlePaySdk: IGooglePaySessionPaymentsClient;
  private config: IConfig;
  private destroy$: Observable<IMessageBusEvent>;

  constructor(
    private configProvider: ConfigProvider,
    private googlePayPaymentService: GooglePayPaymentService,
    private jwtDecoder: JwtDecoder,
    private messageBus: IMessageBus,
    private googlePaySdkProvider: IGooglePaySdkProvider,
    private sentryService: SentryService
  ) {
    this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
  }

  init(config: IConfig): Observable<IConfig> {
    this.config = config;

    return this.googlePaySdkProvider
      .setupSdk$(config)
      .pipe(
        this.sentryService.captureAndReportResourceLoadingTimeout('Google Pay script load timeout'),
        tap((googlePaySdk: IGooglePaySessionPaymentsClient) => {
          this.googlePaySdk = googlePaySdk;
          this.addGooglePayButton();
        }),
        switchMap(() => this.configProvider.getConfig$()),
        tap((config: IConfig) => {
          this.config = config;
          this.updateJwtListener();
        })
      );
  }

  private updateConfigWithJWT(jwt: string): IConfig {
    this.config.jwt = jwt;
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
        tap((event: IMessageBusEvent<IUpdateJwt>) => {
          this.updateConfigWithJWT(event.data.newJwt);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private addGooglePayButton(): void {
    const { buttonRootNode, buttonColor, buttonType, buttonLocale } = this.config.googlePay.buttonOptions;
    const button = this.googlePaySdk.createButton({
      buttonColor,
      buttonType,
      buttonLocale,
      onClick: this.onGooglePaymentButtonClicked,
    });

    document.getElementById(buttonRootNode).appendChild(button);
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
        allowedPaymentMethods,
        transactionInfo: {
          countryCode,
          currencyCode,
          totalPriceStatus,
          totalPrice,
        },
        merchantInfo: {
          merchantName: merchantInfo.merchantName,
          merchantId: merchantInfo.merchantId,
          merchantOrigin: merchantInfo.merchantOrigin,
        },
      }
    );
    return paymentDataRequest;
  }

  private onGooglePaymentButtonClicked = (): void => {
    const paymentDataRequest = this.getGooglePaymentDataRequest();

    this.googlePaySdk
      .loadPaymentData({ ...paymentDataRequest, transactionInfo: { ...paymentDataRequest.transactionInfo } })
      .then((paymentData: IPaymentData) => {
        this.onPaymentAuthorized(paymentData);
      })
      .catch((err: { statusCode: 'ERROR' | 'CANCELED' }) => {
        switch (err.statusCode) {
          case 'CANCELED': {
            this.onPaymentCancel();
            break;
          }
          default: {
            this.onPaymentError();
            break;
          }
        }
      });
  };

  private onPaymentAuthorized(paymentData: IPaymentData): void {
    const formData = DomMethods.parseForm(this.config.formId);
    return this.googlePayPaymentService.processPayment(formData, paymentData);
  }

  private onPaymentCancel(): void {
    const formData = DomMethods.parseForm(this.config.formId);
    return this.googlePayPaymentService.cancelPayment(formData);
  }

  private onPaymentError(): void {
    const formData = DomMethods.parseForm(this.config.formId);
    return this.googlePayPaymentService.errorPayment(formData);
  }
}
