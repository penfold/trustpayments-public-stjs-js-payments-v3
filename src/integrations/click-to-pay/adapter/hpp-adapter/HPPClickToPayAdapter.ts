import { Service } from 'typedi';
import { BehaviorSubject, EMPTY, firstValueFrom, Observable } from 'rxjs';
import { catchError, filter, mapTo, tap } from 'rxjs/operators';
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
import { IInitialCheckoutData } from '../../digital-terminal/interfaces/IInitialCheckoutData';
import { CardListGenerator } from '../../card-list/CardListGenerator';
import { IUpdateView } from '../interfaces/IUpdateView';
import { IHPPClickToPayAdapterInitParams } from './IHPPClickToPayAdapterInitParams';
import { HPPUserIdentificationService } from './HPPUserIdentificationService';
import { HPPCheckoutDataProvider } from './HPPCheckoutDataProvider';

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
    private hppCheckoutDataProvider: HPPCheckoutDataProvider
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
      this.cardListGenerator.displayCards(this.initParams.cardListContainerId, cardList.aggregatedCards);
      this.initParams.onUpdateView?.call(null, {
        displayCardForm: false,
      } as IUpdateView);
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
        this.hppCheckoutDataProvider.getCheckoutData(initParams.formId).subscribe(data => this.checkout(data));
      })
    );
  }

  private checkout(capturedCheckoutData: IInitialCheckoutData) {
    const checkoutData: IInitialCheckoutData = {
      ...capturedCheckoutData,
      dpaTransactionOptions: this.initParams.dpaTransactionOptions,
    };

    this.digitalTerminal.checkout(checkoutData).pipe(
      catchError(e => {
        console.error(e);// TODO add better error handling
        return EMPTY;
      })
    ).subscribe(response => {
      this.initParams.onCheckout?.call(null, response);

    });
  }
}
