import { Observable, Subscriber } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Service } from 'typedi';
import { IVisaCheckoutClientStatus } from '../../../../client/integrations/visa-checkout/IVisaCheckoutClientStatus';
import { VisaCheckoutClientStatus } from '../../../../client/integrations/visa-checkout/VisaCheckoutClientStatus';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMerchantData } from '../../models/IMerchantData';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { IVisaCheckoutSdk, IVisaCheckoutSdkLib } from './visa-checkout-sdk-provider/IVisaCheckoutSdk';
import { VisaCheckoutSdkProvider } from './visa-checkout-sdk-provider/VisaCheckoutSdkProvider';
import { IVisaCheckoutStatusDataCancel } from './visa-checkout-status-data/IVisaCheckoutStatusDataCancel';
import { IVisaCheckoutStatusDataError } from './visa-checkout-status-data/IVisaCheckoutStatusDataError';
import { IVisaCheckoutStatusDataPrePayment } from './visa-checkout-status-data/IVisaCheckoutStatusDataPrePayment';
import { IVisaCheckoutStatusDataSuccess } from './visa-checkout-status-data/IVisaCheckoutStatusDataSuccess';
import { VisaCheckoutResponseType } from './VisaCheckoutResponseType';

declare const V: any;

@Service()
export class VisaCheckout {
  constructor(
    protected interFrameCommunicator: InterFrameCommunicator,
    protected visaCheckoutSdkProvider: VisaCheckoutSdkProvider
  ) {}

  init(): void {
    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.VISA_CHECKOUT_START)
      .thenRespond((event: IMessageBusEvent<IConfig>) => {
        return this.visaCheckoutSdkProvider.getSdk$(event.data).pipe(
          switchMap((visaCheckoutSdk: IVisaCheckoutSdk) => {
            return new Observable<IVisaCheckoutClientStatus>((observer: Subscriber<IVisaCheckoutClientStatus>) => {
              // this.onSuccess(observer, visaCheckoutSdk.lib, event.data);

              V.on(VisaCheckoutResponseType.cancel, (cancelData: IVisaCheckoutStatusDataCancel) => {
                this.onCancel(observer, cancelData);
              });
              visaCheckoutSdk.lib.on(VisaCheckoutResponseType.error, (errorData: IVisaCheckoutStatusDataError) => {
                this.onError(observer, errorData);
              });

              // this.onPrePayment(observer, visaCheckoutSdk.lib);

              visaCheckoutSdk.lib.init(visaCheckoutSdk.updateConfig.visaInitConfig);
            });
          })
        );
      });
  }

  private onSuccess(observer: Subscriber<IVisaCheckoutClientStatus>, lib: IVisaCheckoutSdkLib, config: IConfig): void {
    const merchantData: IMerchantData = DomMethods.parseForm(config.formId) ? DomMethods.parseForm(config.formId) : {};

    lib.on(VisaCheckoutResponseType.success, (successData: IVisaCheckoutStatusDataSuccess) => {
      observer.next({
        status: VisaCheckoutClientStatus.SUCCESS,
        data: successData,
        merchantData
      });
    });
  }

  protected onCancel(
    observer: Subscriber<IVisaCheckoutClientStatus>,
    cancelData?: IVisaCheckoutStatusDataCancel
  ): void {
    observer.next({
      status: VisaCheckoutClientStatus.CANCEL,
      data: cancelData
    });
  }

  protected onError(observer: Subscriber<IVisaCheckoutClientStatus>, errorData?: IVisaCheckoutStatusDataError): void {
    observer.next({
      status: VisaCheckoutClientStatus.ERROR,
      data: errorData
    });
  }

  private onPrePayment(observer: Subscriber<IVisaCheckoutClientStatus>, lib: IVisaCheckoutSdkLib): void {
    lib.on(VisaCheckoutResponseType.prePayment, (prePaymentData: IVisaCheckoutStatusDataPrePayment) => {
      observer.next({
        status: VisaCheckoutClientStatus.PRE_PAYMENT,
        data: prePaymentData
      });
    });
  }
}
