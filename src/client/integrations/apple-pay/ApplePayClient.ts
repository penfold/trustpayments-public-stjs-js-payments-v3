import { BehaviorSubject, from, Observable } from 'rxjs';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { filter, switchMap, tap } from 'rxjs/operators';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { Service } from 'typedi';
import { MessageBus } from '../../../application/core/shared/message-bus/MessageBus';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IUpdateJwt } from '../../../application/core/models/IUpdateJwt';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';

@Service()
export class ApplePayClient {
  private config$: BehaviorSubject<IConfig> = new BehaviorSubject<IConfig>(null);

  constructor(
    private configProvider: ConfigProvider,
    private interFrameCommunicator: InterFrameCommunicator,
    private messageBus: MessageBus
  ) {}

  init$(): Observable<unknown> {
    return this.config$.pipe(
      filter((config: IConfig) => config !== null),
      switchMap((config: IConfig) => {
        return from(
          this.interFrameCommunicator.query(
            {
              type: PUBLIC_EVENTS.APPLE_PAY_START,
              data: config as IConfig
            },
            MERCHANT_PARENT_FRAME
          )
        );
      })
    );
  }

  watchConfigAndJwtUpdates(): void {
    this.configProvider.getConfig$().subscribe(v => {
      this.config$.next(v);
    });
    this.messageBus
      .pipe(ofType(MessageBus.EVENTS_PUBLIC.UPDATE_JWT))
      .subscribe((event: IMessageBusEvent<IUpdateJwt>) => {
        this.config$.next({
          ...this.config$.value,
          jwt: event.data.newJwt
        });
      });
  }

  private _onSuccess$(): void {
    return;
  }

  private _onError$(): void {
    return;
  }

  private _onCancel$(): void {
    return;
  }
}
