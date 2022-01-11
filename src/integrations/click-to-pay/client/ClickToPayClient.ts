import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { IClickToPayConfig } from '../models/IClickToPayConfig';

@Service()
export class ClickToPayClient {
  init(config: IClickToPayConfig): Observable<unknown> {
    return of(null);
  }
}
