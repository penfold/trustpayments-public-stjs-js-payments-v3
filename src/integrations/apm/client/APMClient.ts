import { Service } from 'typedi';
import { IConfig } from '../../../shared/model/config/IConfig';
import { Observable, of } from 'rxjs';

@Service()
export class APMClient {
  init(config: IConfig): Observable<unknown> {
    return of(null); // TODO
  }
}
