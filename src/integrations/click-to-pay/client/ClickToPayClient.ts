import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { IClickToPayConfig } from '../models/IClickToPayConfig';
import { ClickToPayButtonService } from './services/ClickToPayButtonService';

@Service()
export class ClickToPayClient {
  constructor(
    private clickToPayButtonService: ClickToPayButtonService,
  ) {
  }

  init(config: IClickToPayConfig): Observable<unknown> {
    this.clickToPayButtonService.insertClickToPayButton(config);
    return of(null);
  }
}
