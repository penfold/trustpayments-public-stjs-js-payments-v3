import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { filter, map, mapTo, tap } from 'rxjs/operators';
import { IClickToPayAdapter } from '../IClickToPayClientAdapter';
import { DigitalTerminal } from '../../digital-terminal/DigitalTerminal';
import { IInitPaymentMethod } from '../../../../application/core/services/payments/events/IInitPaymentMethod';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { ClickToPayPaymentMethodName } from '../../models/ClickToPayPaymentMethodName';
import { EventScope } from '../../../../application/core/models/constants/EventScope';
import { IMessageBusEvent } from '../../../../application/core/models/IMessageBusEvent';
import { IFrameQueryingService } from '../../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IIdentificationData } from '../../digital-terminal/interfaces/IIdentificationData';

import { IHPPClickToPayAdapterInitParams } from './IHPPClickToPayAdapterInitParams';

export class HPPClickToPayAdapter implements IClickToPayAdapter<IHPPClickToPayAdapterInitParams, HPPClickToPayAdapter> {
  constructor(private digitalTerminal: DigitalTerminal, private messageBus: IMessageBus, private frameQueryingService: IFrameQueryingService) {
  }

  init(initParams: IHPPClickToPayAdapterInitParams): Promise<HPPClickToPayAdapter> {
    this.startPaymentMethodInit(initParams);
    return this.completePaymentMethodInit(initParams);
  }

  isRecognized(): Promise<boolean> {
    return firstValueFrom(this.digitalTerminal.isRecognized());
  }

  identifyUser(identificationData?: IIdentificationData): Promise<boolean> {
    return firstValueFrom(this.digitalTerminal.identifyUser(identificationData).pipe(map(response => !!response)));
  }

  showCardList(): Promise<void> {
    return Promise.resolve(null);
  }

  private startPaymentMethodInit(initParams: IHPPClickToPayAdapterInitParams) {
    this.messageBus.publish<IInitPaymentMethod<IHPPClickToPayAdapterInitParams>>(
      {
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: {
          name: ClickToPayPaymentMethodName,
          config: initParams,
        },
      },
      EventScope.THIS_FRAME
    );
  }

  private completePaymentMethodInit(data): Promise<HPPClickToPayAdapter> {
    const initialized = new BehaviorSubject<boolean>(false);

    this.frameQueryingService.whenReceive(
      PUBLIC_EVENTS.CLICK_TO_PAY_INIT,
      (event: IMessageBusEvent<IHPPClickToPayAdapterInitParams>) => {
        return this.initAdapter(event.data)
          .pipe(
            tap(() => initialized.next(true))
          );
      }
    );

    // when adapter is initialized return reference to it
    return firstValueFrom(initialized.asObservable().pipe(filter(Boolean), mapTo(this)));
  }

  private initAdapter(data: IHPPClickToPayAdapterInitParams): Observable<void> {
    return this.digitalTerminal.init(data).pipe(
      tap(() => {
        // TODO initialize everything else here
      })
    );
  }
}

