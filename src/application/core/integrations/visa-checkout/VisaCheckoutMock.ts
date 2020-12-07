import { map, switchMap } from 'rxjs/operators';
import { Service } from 'typedi';
import { environment } from '../../../../environments/environment';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { VisaCheckoutButtonProps } from './visa-checkout-button-service/VisaCheckoutButtonProps';
import { VisaCheckoutSdkProvider } from './visa-checkout-sdk-provider/VisaCheckoutSdkProvider';
import { IVisaCheckoutStatusData } from './visa-checkout-status-data/IVisaCheckoutStatusData';
import { IVisaCheckoutStatusDataSuccess } from './visa-checkout-status-data/IVisaCheckoutStatusDataSuccess';
import { VisaCheckout } from './VisaCheckout';

@Service()
export class VisaCheckoutMock extends VisaCheckout {
  constructor(protected visaCheckoutSdkProvider: VisaCheckoutSdkProvider, protected messageBus: MessageBus) {
    super(visaCheckoutSdkProvider, messageBus);
  }

  init(): void {
    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.VISA_CHECKOUT_CONFIG))
      .pipe(
        switchMap((event: IMessageBusEvent<IConfig>) => {
          return this.visaCheckoutSdkProvider.getSdk$(event.data).pipe(
            map(() => {
              return event.data;
            })
          );
        })
      )
      .subscribe((config: IConfig) => {
        DomMethods.addListener(VisaCheckoutButtonProps.id, 'click', () => {
          fetch(environment.VISA_CHECKOUT_URLS.MOCK_DATA_URL)
            .then((response: Body) => response.json() as IVisaCheckoutStatusData)
            .then(({ payment, status }: any) => {
              this.proceedWithMockData(payment, status, config);
            });
        });
      });
  }

  private proceedWithMockData(payment: IVisaCheckoutStatusDataSuccess, status: string, config: IConfig): void {
    switch (status) {
      case 'SUCCESS':
        this.onSuccess(config, payment);
        break;

      case 'ERROR':
        this.onError();
        break;

      case 'WARNING':
        this.onCancel();
        break;

      default:
        console.error(`Unknown status from ${environment.VISA_CHECKOUT_URLS.MOCK_DATA_URL} endpoint`);
    }
  }
}
