import { map, pluck } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Service } from 'typedi';
import { IStJwtPayload } from '../../../application/core/models/IStJwtPayload';
import { ConfigProvider } from '../config-provider/ConfigProvider';
import { JwtDecoder } from '../jwt-decoder/JwtDecoder';

@Service()
export class JwtProvider {
  constructor(
    private configProvider: ConfigProvider,
    private jwtDecoder: JwtDecoder,
  ) {
  }

  getJwtPayload(): Observable<IStJwtPayload> {
    return this.getRawJwt().pipe(
      map(jwt => this.jwtDecoder.decode(jwt).payload),
    );
  }

  getRawJwt(): Observable<string> {
    return this.configProvider.getConfig$().pipe(
      pluck('jwt'),
    );
  }
}
