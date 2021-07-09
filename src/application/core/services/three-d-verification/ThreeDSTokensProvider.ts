import { Service } from 'typedi';
import { defer, merge, Observable } from 'rxjs';
import { first, map, shareReplay, switchMap } from 'rxjs/operators';
import { IThreeDSTokens } from './data/IThreeDSTokens';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { IGatewayClient } from '../gateway-client/IGatewayClient';

@Service()
export class ThreeDSTokensProvider {
  private threeDSTokens$: Observable<IThreeDSTokens>;

  constructor(
    private gatewayClient: IGatewayClient,
    private messageBus: IMessageBus,
  ) {
    const initialTokens = defer(() => this.fetchNewTokensFromJsInit());
    const updatedTokens = this.messageBus.pipe(
      ofType(PUBLIC_EVENTS.UPDATE_JWT),
      switchMap(() => this.fetchNewTokensFromJsInit()),
    );

    this.threeDSTokens$ = merge(initialTokens, updatedTokens).pipe(shareReplay(1));
  }

  getTokens(): Observable<IThreeDSTokens> {
    return this.threeDSTokens$.pipe(first());
  }

  private fetchNewTokensFromJsInit(): Observable<IThreeDSTokens> {
    return this.gatewayClient
      .jsInit()
      .pipe(map(response => ({
        cacheToken: response.cachetoken,
        jwt: response.threedinit,
      })));
  }
}
