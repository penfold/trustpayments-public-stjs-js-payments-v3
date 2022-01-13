import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { IClickToPayConfig } from '../models/IClickToPayConfig';
import { CLICK_TO_PAY_BUTTON_ID } from '../ClickToPayButtonProperties';
import { ClickToPayButtonService } from './services/ClickToPayButtonService';
import { ClickToPayPaymentService } from './ClickToPayPaymentService';

@Service()
export class ClickToPayClient {
  constructor(
    private clickToPayButtonService: ClickToPayButtonService,
    private clickToPayPaymentService: ClickToPayPaymentService
  ) {}

  init(config: IClickToPayConfig): Observable<unknown> {
    this.clickToPayButtonService.insertClickToPayButton(config);
    this.clickToPayButtonService.bindClickHandler(() => {
      this.clickToPayPaymentService.processPayment(config);
    }, config.buttonPlacement || CLICK_TO_PAY_BUTTON_ID);
    return of(null);
  }

}
