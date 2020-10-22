import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IThreeDSTokens } from './data/IThreeDSTokens';
import { GatewayClient } from '../GatewayClient';

@Service()
export class ThreeDSTokensProvider {
  constructor(private gatewayClient: GatewayClient) {}

  getTokens(): Observable<IThreeDSTokens> {
    return this.gatewayClient
      .jsInit()
      .pipe(map(response => ({ cacheToken: response.cachetoken, jwt: response.threedinit })));
  }
}
