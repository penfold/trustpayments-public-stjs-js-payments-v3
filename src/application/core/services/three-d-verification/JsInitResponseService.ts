import { Observable } from 'rxjs';
import { Service } from 'typedi';
import { shareReplay, startWith, switchMap } from 'rxjs/operators';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { IGatewayClient } from '../gateway-client/IGatewayClient';

@Service()
export class JsInitResponseService {
  private jsInitResponse$: Observable<IThreeDInitResponse>;

  constructor(
    private messageBus: IMessageBus,
    private gatewayClient: IGatewayClient,
  ) {
  }

  getJsInitResponse(gatewayClient?: IGatewayClient): Observable<IThreeDInitResponse> {
    this.jsInitResponse$ = this.messageBus.pipe(
      ofType(PUBLIC_EVENTS.UPDATE_JWT),
      startWith({ type: PUBLIC_EVENTS.UPDATE_JWT }),
      switchMap(() => gatewayClient?.jsInit() || this.gatewayClient.jsInit()),
      shareReplay(1),
    );

    return this.jsInitResponse$;
  }
}
