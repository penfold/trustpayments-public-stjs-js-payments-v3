import { Observable, Subscriber } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Service } from 'typedi';
import { IVisaCheckoutClientStatus } from '../../../../client/integrations/visa-checkout/IVisaCheckoutClientStatus';
import { VisaCheckoutClientStatus } from '../../../../client/integrations/visa-checkout/VisaCheckoutClientStatus';
import { environment } from '../../../../environments/environment';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { VisaCheckoutButtonProps } from './visa-checkout-button-service/VisaCheckoutButtonProps';
import { IVisaCheckoutSdk } from './visa-checkout-sdk-provider/IVisaCheckoutSdk';
import { VisaCheckoutSdkProvider } from './visa-checkout-sdk-provider/VisaCheckoutSdkProvider';
import { IVisaCheckoutStatusData } from './visa-checkout-status-data/IVisaCheckoutStatusData';
import { IVisaCheckoutStatusDataCancel } from './visa-checkout-status-data/IVisaCheckoutStatusDataCancel';
import { IVisaCheckoutStatusDataError } from './visa-checkout-status-data/IVisaCheckoutStatusDataError';
import { VisaCheckout } from './VisaCheckout';
import { VisaCheckoutResponseType } from './VisaCheckoutResponseType';

@Service()
export class VisaCheckoutMock extends VisaCheckout {
  constructor(
    protected interFrameCommunicator: InterFrameCommunicator,
    protected visaCheckoutSdkProvider: VisaCheckoutSdkProvider
  ) {
    super(interFrameCommunicator, visaCheckoutSdkProvider);
  }

  init(): void {
    this.interFrameCommunicator
      .whenReceive(PUBLIC_EVENTS.VISA_CHECKOUT_START)
      .thenRespond((event: IMessageBusEvent<IConfig>) => {
        return this.visaCheckoutSdkProvider.getSdk$(event.data).pipe(
          switchMap(() => {
            return new Observable<IVisaCheckoutClientStatus>((observer: Subscriber<IVisaCheckoutClientStatus>) => {
              DomMethods.addListener(VisaCheckoutButtonProps.id, 'click', () => {
                this.onCancel(observer);
              });
            });
          })
        );
      });
  }
}
