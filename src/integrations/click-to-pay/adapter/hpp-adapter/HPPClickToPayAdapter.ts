import { Service } from 'typedi';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { filter, mapTo, tap } from 'rxjs/operators';
import { IClickToPayAdapter } from '../interfaces/IClickToPayClientAdapter';
import { DigitalTerminal } from '../../digital-terminal/DigitalTerminal';
import { IInitPaymentMethod } from '../../../../application/core/services/payments/events/IInitPaymentMethod';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { ClickToPayPaymentMethodName } from '../../models/ClickToPayPaymentMethodName';
import { EventScope } from '../../../../application/core/models/constants/EventScope';
import { IMessageBusEvent } from '../../../../application/core/models/IMessageBusEvent';
import { IFrameQueryingService } from '../../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IIdentificationData } from '../../digital-terminal/interfaces/IIdentificationData';
import { SrcNameFinder } from '../../digital-terminal/SrcNameFinder';
import { SrcName } from '../../digital-terminal/SrcName';
import { IIdentificationResult } from '../../digital-terminal/interfaces/IIdentificationResult';
import { CardListGenerator } from '../../card-list/CardListGenerator';
import { IHPPClickToPayAdapterInitParams } from './IHPPClickToPayAdapterInitParams';
import { HPPUserIdentificationService } from './HPPUserIdentificationService';

@Service()
export class HPPClickToPayAdapter implements IClickToPayAdapter<IHPPClickToPayAdapterInitParams, HPPClickToPayAdapter> {
  private initParams: IHPPClickToPayAdapterInitParams;

  constructor(
    private digitalTerminal: DigitalTerminal,
    private messageBus: IMessageBus,
    private frameQueryingService: IFrameQueryingService,
    private userIdentificationService: HPPUserIdentificationService,
    private srcNameFinder: SrcNameFinder,
    private cardListGenerator: CardListGenerator,
  ) {
  }

  init(initParams: IHPPClickToPayAdapterInitParams): Promise<HPPClickToPayAdapter> {
    this.initParams = initParams;
    this.startPaymentMethodInit(initParams);
    return this.completePaymentMethodInit(initParams);
  }

  isRecognized(): Promise<boolean> {
    return firstValueFrom(this.digitalTerminal.isRecognized());
  }

  identifyUser(identificationData?: IIdentificationData): Promise<IIdentificationResult> {
    this.userIdentificationService.setInitParams(this.initParams);
    return firstValueFrom(this.digitalTerminal.identifyUser(this.userIdentificationService, identificationData));
  }

  private showUserDetails(): void {
    this.digitalTerminal.getSrcProfiles().subscribe(userData => {
      this.cardListGenerator.displayUserInformation(this.initParams.cardListContainerId, userData.srcProfiles);
    });
  }

  showCardList(): void {
    this.digitalTerminal.getSrcProfiles().subscribe(cardList => {
      this.cardListGenerator.displayCards(this.initParams.formId, this.initParams.cardListContainerId, cardList.aggregatedCards);
    });
    this.showUserDetails();
  }

  getSrcName(pan: string): Promise<SrcName | null> {
    return firstValueFrom(this.srcNameFinder.findSrcNameByPan(pan));
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

  private initAdapter(initParams: IHPPClickToPayAdapterInitParams): Observable<void> {
    return this.digitalTerminal.init(initParams).pipe(
      tap(() => {
        // TODO initialize everything else here
      })
    );
  }
}
