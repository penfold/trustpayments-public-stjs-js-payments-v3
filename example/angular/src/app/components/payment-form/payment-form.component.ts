import { AfterViewInit, Component, Input } from '@angular/core';
import { IPageOptions } from '../../services/page-options.interface';
import { SecureTradingService } from '../../services/secure-trading.service';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
})
export class PaymentFormComponent implements AfterViewInit {
  @Input() config: any;
  @Input() pageOptions: IPageOptions;

  constructor(private secureTradingService: SecureTradingService) {}

  ngAfterViewInit(): void {
    this.secureTradingService.initStandardPaymentMethods([
      'Components',
      'VisaCheckout',
      'ApplePay',
      'GooglePay',
    ], this.config);
  }

  updateJwt(): void {
    if (this.pageOptions.updatedJwt) {
      this.secureTradingService.updateJWT(this.pageOptions.updatedJwt);
    }
  }
}
