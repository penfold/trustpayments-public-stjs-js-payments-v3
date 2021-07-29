import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { RequestType } from '../../../../shared/types/RequestType';
import { filter, first, map } from 'rxjs/operators';
import { IStJwtPayload } from '../../models/IStJwtPayload';
import { IStore } from '../../store/IStore';
import { IApplicationFrameState } from '../../store/state/IApplicationFrameState';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';

@Service()
export class RemainingRequestTypesProvider {
  constructor(
    private store: IStore<IApplicationFrameState>,
    private jwtDecoder: JwtDecoder,
  ) {}

  getRemainingRequestTypes(): Observable<RequestType[]> {
    return this.store.select(state => state.jwt).pipe(
      filter(jwt => Boolean(jwt)),
      map(jwt => this.jwtDecoder.decode<IStJwtPayload>(jwt)),
      map(decodedJwt => decodedJwt.payload.requesttypedescriptions),
      first(),
    );
  }
}
