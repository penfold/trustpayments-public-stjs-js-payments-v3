import { map, switchMap, takeUntil } from 'rxjs/operators';
import { Service } from 'typedi';
import { IVisaCheckoutClientStatus } from '../../../../client/integrations/visa-checkout/IVisaCheckoutClientStatus';
import { VisaCheckoutClientStatus } from '../../../../client/integrations/visa-checkout/VisaCheckoutClientStatus';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMerchantData } from '../../models/IMerchantData';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { IVisaCheckoutSdk } from './visa-checkout-sdk-provider/IVisaCheckoutSdk';
import { VisaCheckoutSdkProvider } from './visa-checkout-sdk-provider/VisaCheckoutSdkProvider';
import { IVisaCheckoutStatusDataCancel } from './visa-checkout-status-data/IVisaCheckoutStatusDataCancel';
import { IVisaCheckoutStatusDataError } from './visa-checkout-status-data/IVisaCheckoutStatusDataError';
import { IVisaCheckoutStatusDataPrePayment } from './visa-checkout-status-data/IVisaCheckoutStatusDataPrePayment';
import { IVisaCheckoutStatusDataSuccess } from './visa-checkout-status-data/IVisaCheckoutStatusDataSuccess';
import { VisaCheckoutUpdateService } from './visa-checkout-update-service/VisaCheckoutUpdateService';
import { VisaCheckoutResponseType } from './VisaCheckoutResponseType';
import { Observable } from 'rxjs';
import { TERM_URL } from '../../models/constants/RequestData';

@Service()
export class VisaCheckout {
  private destroy$: Observable<IMessageBusEvent<unknown>>;

  constructor(
    protected visaCheckoutSdkProvider: VisaCheckoutSdkProvider,
    protected messageBus: IMessageBus,
    protected visaCheckoutUpdateService: VisaCheckoutUpdateService
  ) {
    this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
  }

  init(): void {
    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.VISA_CHECKOUT_CONFIG))
      .pipe(
        map((event: IMessageBusEvent<IConfig>) => {
          return {
            config: event.data,
            visaCheckoutUpdateConfig: this.visaCheckoutUpdateService.updateConfigObject(event.data)
          };
        }),
        switchMap(({ config, visaCheckoutUpdateConfig }) => {
          return this.visaCheckoutSdkProvider
            .getSdk$(config, this.visaCheckoutUpdateService.updateConfigObject(config))
            .pipe(
              map((visaCheckoutSdk: IVisaCheckoutSdk) => {
                visaCheckoutSdk.on(VisaCheckoutResponseType.cancel, (cancelData: IVisaCheckoutStatusDataCancel) => {
                  this.onCancel(cancelData);
                });
                visaCheckoutSdk.on(VisaCheckoutResponseType.error, (errorData: IVisaCheckoutStatusDataError) => {
                  this.onError(errorData);
                });
                visaCheckoutSdk.on(
                  VisaCheckoutResponseType.prePayment,
                  (prePaymentData: IVisaCheckoutStatusDataPrePayment) => {
                    this.onPrePayment(prePaymentData);
                  }
                );
                visaCheckoutSdk.on(VisaCheckoutResponseType.success, (successData: IVisaCheckoutStatusDataSuccess) => {
                  this.onSuccess(config, successData);
                });

                visaCheckoutSdk.init(visaCheckoutUpdateConfig.visaInitConfig);
              })
            );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  protected onSuccess(config: IConfig, successData: IVisaCheckoutStatusDataSuccess): void {
    const merchantData: IMerchantData = {
      ...DomMethods.parseForm(config.formId),
      termurl: TERM_URL
    };

    this.messageBus.publish<IVisaCheckoutClientStatus>({
      type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
      data: {
        status: VisaCheckoutClientStatus.SUCCESS,
        data: successData,
        merchantData
      }
    });
  }

  protected onCancel(cancelData?: IVisaCheckoutStatusDataCancel): void {
    this.messageBus.publish<IVisaCheckoutClientStatus>({
      type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
      data: {
        status: VisaCheckoutClientStatus.CANCEL,
        data: cancelData
      }
    });
  }

  protected onError(errorData?: IVisaCheckoutStatusDataError): void {
    this.messageBus.publish<IVisaCheckoutClientStatus>({
      type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
      data: {
        status: VisaCheckoutClientStatus.ERROR,
        data: errorData
      }
    });
  }

  protected onPrePayment(prePaymentData: IVisaCheckoutStatusDataPrePayment): void {
    this.messageBus.publish<IVisaCheckoutClientStatus>({
      type: PUBLIC_EVENTS.VISA_CHECKOUT_STATUS,
      data: {
        status: VisaCheckoutClientStatus.PRE_PAYMENT,
        data: prePaymentData
      }
    });
  }
}
