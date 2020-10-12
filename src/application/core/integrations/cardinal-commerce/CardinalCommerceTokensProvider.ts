import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { ICardinalCommerceTokens } from './ICardinalCommerceTokens';
import { GatewayClient } from '../../services/GatewayClient';
import { map } from 'rxjs/operators';

@Service()
export class CardinalCommerceTokensProvider {
  constructor(private gatewayClient: GatewayClient) {}

  getTokens(): Observable<ICardinalCommerceTokens> {
    return this.gatewayClient
      .jsInit()
      .pipe(map(response => ({ cacheToken: response.cachetoken, jwt: response.threedinit })));
  }
}
