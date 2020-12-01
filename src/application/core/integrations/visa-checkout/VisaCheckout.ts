import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Service } from 'typedi';
import { IVisaCheckoutClientStatus } from '../../../../client/integrations/visa-checkout/IVisaCheckoutClientStatus';
import { VisaCheckoutClientStatus } from '../../../../client/integrations/visa-checkout/VisaCheckoutClientStatus';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
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

declare const VisaCheckoutLibrary: {
  init: (visaInitConfig: IVisaCheckoutInitConfig) => {};
  on: (callbackType: VisaCheckoutResponseType, callback: (statusData: IVisaCheckoutStatusData) => void) => {};
};

@Service()
export class VisaCheckout {
  constructor(
    private interFrameCommunicator: InterFrameCommunicator,
    private messageBus: MessageBus,
    private visaCheckoutButtonService: VisaCheckoutButtonService,
    private visaCheckoutUpdateService: VisaCheckoutUpdateService,
    private _messageBus: MessageBus
  ) {}

  init(): void {
    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.VISA_CHECKOUT_START)
      .thenRespond((event: IMessageBusEvent<IConfig>) => {
        return this.loadSdk$(event.data).pipe(
          switchMap((visaCheckoutUpdateConfig: IVisaCheckoutUpdateConfig) => {
            this.visaCheckoutButtonService.customize(
              event.data.visaCheckout.buttonSettings,
              visaCheckoutUpdateConfig.buttonUrl
            );
            this.visaCheckoutButtonService.mount(
              event.data.visaCheckout.placement,
              event.data.visaCheckout.buttonSettings,
              visaCheckoutUpdateConfig.buttonUrl
            );
            this._updateJwtListener();

            return new Observable<IVisaCheckoutClientStatus>(observer => {
              VisaCheckoutLibrary.init(visaCheckoutUpdateConfig.visaInitConfig);
              VisaCheckoutLibrary.on(
                VisaCheckoutResponseType.success,
                (successData: IVisaCheckoutStatusDataSuccess) => {
                  observer.next({
                    status: VisaCheckoutClientStatus.SUCCESS,
                    data: successData
                  });
                }
              );
              VisaCheckoutLibrary.on(VisaCheckoutResponseType.cancel, (cancelData: IVisaCheckoutStatusDataCancel) => {
                observer.next({
                  status: VisaCheckoutClientStatus.CANCEL,
                  data: cancelData
                });
              });
              VisaCheckoutLibrary.on(VisaCheckoutResponseType.error, (errorData: IVisaCheckoutStatusDataError) => {
                observer.next({
                  status: VisaCheckoutClientStatus.ERROR,
                  data: errorData
                });
              });
              VisaCheckoutLibrary.on(
                VisaCheckoutResponseType.prePayment,
                (prePaymentData: IVisaCheckoutStatusDataPrePayment) => {
                  observer.next({
                    status: VisaCheckoutClientStatus.PRE_PAYMENT,
                    data: prePaymentData
                  });
                }
              );
            });
          })
        );
      });
  }

  private loadSdk$(config: IConfig): Observable<IVisaCheckoutUpdateConfig> {
    const jwtPayload: IStJwtPayload = new StJwt(config.jwt).payload;
    const updatedVisaConfig: IVisaCheckoutUpdateConfig = this.visaCheckoutUpdateService.updateConfigObject(
      config.visaCheckout,
      jwtPayload,
      config.livestatus
    );

    return from(
      DomMethods.insertScript(config.visaCheckout.placement, {
        src: updatedVisaConfig.sdkUrl,
        id: 'visaCheckout'
      })
    ).pipe(
      switchMap(() => {
        return of(updatedVisaConfig);
      })
    );
  }

  private _updateJwtListener(): void {
    // this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, ({ newJwt }: IUpdateJwt) => {
    //   this._jwt = newJwt ? newJwt : this._jwt;
    //   const { payload }: IStJwtObj = new StJwt(this._jwt);
    //   this._visaInitConfig = this._visaCheckoutUpdateService.updateVisaInit(payload, this._visaInitConfig);
    //   this._visaCheckoutButtonService.customize(this._buttonSettings, this._buttonUrl);
    // });
  }
}
