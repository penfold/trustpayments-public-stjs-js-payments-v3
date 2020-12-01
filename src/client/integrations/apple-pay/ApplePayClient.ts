import { from, Observable } from 'rxjs';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { filter, switchMap, tap } from 'rxjs/operators';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { IApplePayClientStatus } from './IApplePayClientStatus';
import { Service } from 'typedi';

@Service()
export class ApplePayClient {
  private readonly config$: Observable<IConfig>;

  constructor(private configProvider: ConfigProvider, private interFrameCommunicator: InterFrameCommunicator) {
    this.config$ = this.configProvider.getConfig$();
  }

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
}
