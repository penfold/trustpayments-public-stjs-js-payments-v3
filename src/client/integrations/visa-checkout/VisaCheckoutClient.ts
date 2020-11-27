import { from, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Service } from 'typedi';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { VisaCheckoutInstanceFactory } from '../../../application/core/integrations/visa-checkout/visa-checkout-instance-factory/VisaCheckoutInstanceFactory';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { PAYMENT_ERROR, PAYMENT_SUCCESS } from '../../../application/core/models/constants/Translations';
import { IMerchantData } from '../../../application/core/models/IMerchantData';
import { IWallet } from '../../../application/core/models/IWallet';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { Payment } from '../../../application/core/shared/payment/Payment';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { ConfigService } from '../../../shared/services/config-service/ConfigService';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { NotificationService } from '../../notification/NotificationService';

@Service()
export class VisaCheckoutClient {
  private readonly config$: Observable<IConfig>;

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private configProvider: ConfigProvider,
    private visaCheckoutInstanceFactory: VisaCheckoutInstanceFactory,
    private configService: ConfigService,
    private jwtDecoder: JwtDecoder,
    private messageBus: MessageBus,
    private notificationService: NotificationService
  ) {
    this.config$ = this.configProvider.getConfig$();
  }

  init(): void {
    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.VISA_CHECKOUT_SUCCESS)
      .thenRespond((event: any) => this.onSuccess$(event));
  }

  private onSuccess$(event: any): Observable<any> {
    console.log('SIEMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    return this.config$.pipe(
      switchMap((config: IConfig) => {
        const payment: Payment = new Payment();
        const requestTypeDescriptions = this.jwtDecoder.decode(config.jwt).payload.requesttypedescriptions;
        const walletData: IWallet = {
          walletsource: 'VISACHECKOUT',
          wallettoken: JSON.stringify(payment)
        };
        const merchantData: IMerchantData = DomMethods.parseForm(config.formId)
          ? DomMethods.parseForm(config.formId)
          : {};

        return from(payment.processPayment(requestTypeDescriptions, walletData, merchantData)).pipe(
          tap(() => {
            console.log('WHTRBIT', 1);

            this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK }, true);
            this.notificationService.success(PAYMENT_SUCCESS);
            GoogleAnalytics.sendGaData('event', 'Visa Checkout', 'payment status', 'Visa Checkout payment success');
          }),
          catchError(() => {
            console.log('WHTRBIT', 2);

            this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
            this.notificationService.error(PAYMENT_ERROR);

            return of(PAYMENT_ERROR);
          })
        );
      })
    );
  }
}
