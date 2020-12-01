import { from, Observable, of, Subscriber } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Service } from 'typedi';
import { IVisaCheckoutClientStatus } from '../../../../client/integrations/visa-checkout/IVisaCheckoutClientStatus';
import { VisaCheckoutClientStatus } from '../../../../client/integrations/visa-checkout/VisaCheckoutClientStatus';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMerchantData } from '../../models/IMerchantData';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IStJwtPayload } from '../../models/IStJwtPayload';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { StJwt } from '../../shared/stjwt/StJwt';
import { IVisaCheckoutInitConfig } from './IVisaCheckoutInitConfig';
import { VisaCheckoutButtonService } from './visa-checkout-button-service/VisaCheckoutButtonService';
import { IVisaCheckoutStatusData } from './visa-checkout-status-data/IVisaCheckoutStatusData';
import { IVisaCheckoutStatusDataCancel } from './visa-checkout-status-data/IVisaCheckoutStatusDataCancel';
import { IVisaCheckoutStatusDataError } from './visa-checkout-status-data/IVisaCheckoutStatusDataError';
import { IVisaCheckoutStatusDataPrePayment } from './visa-checkout-status-data/IVisaCheckoutStatusDataPrePayment';
import { IVisaCheckoutStatusDataSuccess } from './visa-checkout-status-data/IVisaCheckoutStatusDataSuccess';
import { IVisaCheckoutUpdateConfig } from './visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { VisaCheckoutUpdateService } from './visa-checkout-update-service/VisaCheckoutUpdateService';
import { VisaCheckoutResponseType } from './VisaCheckoutResponseType';

declare const V: {
  init: (visaInitConfig: IVisaCheckoutInitConfig) => {};
  on: (callbackType: VisaCheckoutResponseType, callback: (statusData: IVisaCheckoutStatusData) => void) => {};
};

@Service()
export class VisaCheckout {
  private isSdkLoaded: boolean = false;

  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private messageBus: MessageBus,
    private visaCheckoutButtonService: VisaCheckoutButtonService,
    private visaCheckoutUpdateService: VisaCheckoutUpdateService
  ) {}

  init(): void {
    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.VISA_CHECKOUT_START)
      .thenRespond((event: IMessageBusEvent<IConfig>) => {
        return this.loadSdk$(event.data).pipe(
          switchMap((visaCheckoutUpdatedConfig: IVisaCheckoutUpdateConfig) => {
            return new Observable<IVisaCheckoutClientStatus>((observer: Subscriber<IVisaCheckoutClientStatus>) => {
              V.init(visaCheckoutUpdatedConfig.visaInitConfig);
              this.onSuccess(observer, event.data);
              this.onCancel(observer);
              this.onError(observer);
              this.onPrePayment(observer);
            });
          })
        );
      });
  }

  private onSuccess(observer: Subscriber<IVisaCheckoutClientStatus>, config: IConfig): void {
    const merchantData: IMerchantData = DomMethods.parseForm(config.formId) ? DomMethods.parseForm(config.formId) : {};

    V.on(VisaCheckoutResponseType.success, (successData: IVisaCheckoutStatusDataSuccess) => {
      observer.next({
        status: VisaCheckoutClientStatus.SUCCESS,
        data: successData,
        merchantData
      });
    });
  }

  private onCancel(observer: Subscriber<IVisaCheckoutClientStatus>): void {
    V.on(VisaCheckoutResponseType.cancel, (cancelData: IVisaCheckoutStatusDataCancel) => {
      observer.next({
        status: VisaCheckoutClientStatus.CANCEL,
        data: cancelData
      });
    });
  }

  private onError(observer: Subscriber<IVisaCheckoutClientStatus>): void {
    V.on(VisaCheckoutResponseType.error, (errorData: IVisaCheckoutStatusDataError) => {
      observer.next({
        status: VisaCheckoutClientStatus.ERROR,
        data: errorData
      });
    });
  }

  private onPrePayment(observer: Subscriber<IVisaCheckoutClientStatus>): void {
    V.on(VisaCheckoutResponseType.prePayment, (prePaymentData: IVisaCheckoutStatusDataPrePayment) => {
      observer.next({
        status: VisaCheckoutClientStatus.PRE_PAYMENT,
        data: prePaymentData
      });
    });
  }

  private loadSdk$(config: IConfig): Observable<IVisaCheckoutUpdateConfig> {
    const visaCheckoutUpdatedConfig: IVisaCheckoutUpdateConfig = this.getUpdatedConfig(config);

    if (this.isSdkLoaded) {
      return of(visaCheckoutUpdatedConfig);
    } else {
      return from(
        DomMethods.insertScript(config.visaCheckout.placement, {
          src: visaCheckoutUpdatedConfig.sdkUrl,
          id: 'visaCheckout'
        })
      ).pipe(
        tap(() => {
          this.visaCheckoutButtonService.customize(
            config.visaCheckout.buttonSettings,
            visaCheckoutUpdatedConfig.buttonUrl
          );
          this.visaCheckoutButtonService.mount(
            config.visaCheckout.placement,
            config.visaCheckout.buttonSettings,
            visaCheckoutUpdatedConfig.buttonUrl
          );
          this.isSdkLoaded = true;
        }),
        switchMap(() => {
          return of(visaCheckoutUpdatedConfig);
        })
      );
    }
  }

  private getUpdatedConfig(config: IConfig): IVisaCheckoutUpdateConfig {
    const jwtPayload: IStJwtPayload = new StJwt(config.jwt).payload;

    return this.visaCheckoutUpdateService.updateConfigObject(config.visaCheckout, jwtPayload, config.livestatus);
  }
}
