import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { Service } from 'typedi';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { IVisaCheckoutStatusDataCancel } from '../../../application/core/integrations/visa-checkout/visa-checkout-status-data/IVisaCheckoutStatusDataCancel';
import { IVisaCheckoutStatusDataError } from '../../../application/core/integrations/visa-checkout/visa-checkout-status-data/IVisaCheckoutStatusDataError';
import { IVisaCheckoutStatusDataPrePayment } from '../../../application/core/integrations/visa-checkout/visa-checkout-status-data/IVisaCheckoutStatusDataPrePayment';
import { IVisaCheckoutStatusDataSuccess } from '../../../application/core/integrations/visa-checkout/visa-checkout-status-data/IVisaCheckoutStatusDataSuccess';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import {
  PAYMENT_CANCELLED,
  PAYMENT_ERROR,
  PAYMENT_SUCCESS
} from '../../../application/core/models/constants/Translations';
import { IMerchantData } from '../../../application/core/models/IMerchantData';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IUpdateJwt } from '../../../application/core/models/IUpdateJwt';
import { IWallet } from '../../../application/core/models/IWallet';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { Payment } from '../../../application/core/shared/payment/Payment';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { NotificationService } from '../../notification/NotificationService';
import { IVisaCheckoutClientStatus } from './IVisaCheckoutClientStatus';
import { VisaCheckoutClientStatus } from './VisaCheckoutClientStatus';

@Service()
export class VisaCheckoutClient {
  private config$: BehaviorSubject<IConfig> = new BehaviorSubject<IConfig>(null);

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private messageBus: MessageBus,
    private configProvider: ConfigProvider,
    private jwtDecoder: JwtDecoder,
    private notificationService: NotificationService
  ) {}

  init$(): Observable<VisaCheckoutClientStatus> {
    return this.config$.pipe(
      filter((config: IConfig) => config !== null),
      switchMap((config: IConfig) => {
        return from(
          this.interFrameCommunicator.query(
            {
              type: PUBLIC_EVENTS.VISA_CHECKOUT_START,
              data: config as IConfig
            },
            MERCHANT_PARENT_FRAME
          )
        ).pipe(
          switchMap((status: IVisaCheckoutClientStatus) => {
            switch (status.status) {
              case VisaCheckoutClientStatus.SUCCESS:
                return this.onSuccess$(config, status.data as IVisaCheckoutStatusDataSuccess);

              case VisaCheckoutClientStatus.CANCEL:
                return this.onCancel$(status.data as IVisaCheckoutStatusDataCancel);

              case VisaCheckoutClientStatus.ERROR:
                return this.onError$(status.data as IVisaCheckoutStatusDataError);

              case VisaCheckoutClientStatus.PRE_PAYMENT:
                return this.onPrePayment$(status.data as IVisaCheckoutStatusDataPrePayment);

              default:
                return throwError('Unknown Visa Checkout status');
            }
          })
        );
      })
    );
  }

  public watchConfigAndJwtUpdates(): void {
    this.configProvider.getConfig$().subscribe(v => {
      this.config$.next(v);
    });
    this.messageBus
      .pipe(ofType(MessageBus.EVENTS_PUBLIC.UPDATE_JWT))
      .subscribe((event: IMessageBusEvent<IUpdateJwt>) => {
        this.config$.next({
          ...this.config$.value,
          jwt: event.data.newJwt
        });
      });
  }

  private onSuccess$(config: IConfig, successData: IVisaCheckoutStatusDataSuccess): Observable<any> {
    console.log('ZZZZZZZZZZZZZ', 1);
    const payment: Payment = new Payment();
    const requestTypeDescriptions = this.jwtDecoder.decode(config.jwt).payload.requesttypedescriptions;
    const walletData: IWallet = {
      walletsource: 'VISACHECKOUT',
      wallettoken: JSON.stringify(successData)
    };
    const merchantData: IMerchantData = DomMethods.parseForm(config.formId) ? DomMethods.parseForm(config.formId) : {};

    return from(payment.processPayment(requestTypeDescriptions, walletData, merchantData)).pipe(
      tap(() => {
        console.log('ZZZZZZZZZZZZZ', 2);
        this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK }, true);
        this.notificationService.success(PAYMENT_SUCCESS);
        GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment success');
      }),
      catchError(() => {
        console.log('ZZZZZZZZZZZZZ', 3);
        this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
        this.notificationService.error(PAYMENT_ERROR);

        return of(PAYMENT_ERROR);
      })
    );
  }

  private onCancel$(cancelData: IVisaCheckoutStatusDataCancel): Observable<VisaCheckoutClientStatus.CANCEL> {
    this.notificationService.cancel(PAYMENT_CANCELLED);
    this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_CANCEL_CALLBACK }, true);
    this.messageBus.publish(
      {
        type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE,
        data: {
          errorcode: 'cancelled',
          errormessage: PAYMENT_CANCELLED
        }
      },
      true
    );
    GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment canceled');

    return of(VisaCheckoutClientStatus.CANCEL);
  }

  private onError$(errorData: IVisaCheckoutStatusDataError): Observable<VisaCheckoutClientStatus.ERROR> {
    this.notificationService.error(PAYMENT_ERROR);
    this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
    GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment error');

    return of(VisaCheckoutClientStatus.ERROR);
  }

  private onPrePayment$(
    prePaymentData: IVisaCheckoutStatusDataPrePayment
  ): Observable<VisaCheckoutClientStatus.PRE_PAYMENT> {
    return of(VisaCheckoutClientStatus.PRE_PAYMENT);
  }
}
