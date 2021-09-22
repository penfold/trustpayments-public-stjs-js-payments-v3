import { AfterViewInit, Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPageOptions } from '../../services/page-options.interface';

declare const SecureTrading: any;

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
})
export class PaymentFormComponent implements AfterViewInit {
  @Input() config: any;
  @Input() pageOptions: IPageOptions;
  private st: any;

  private readonly dataCenterUrlAllowed = [
    'https://webservices.securetrading.us/jwt/',
    'https://webservices.securetrading.net/jwt/',
  ];

  constructor(private snackBar: MatSnackBar) {}

  ngAfterViewInit(): void {

    if (this.config.datacenterurl && this.dataCenterUrlAllowed.indexOf(this.config.datacenterurl) === -1) {
      console.error(`${this.config.datacenterurl} is not whitelisted value of datacenterurl property`);
      return;
    }

    this.st = SecureTrading(this.config);
    this.st.Components(this.config.components);
    this.st.VisaCheckout(this.config.visaCheckout);
    this.st.ApplePay(this.config.applePay);
    this.st.GooglePay(this.config.googlePay);

    if (!this.config.successCallback) {
      this.st.on('success', () => {
        this.snackBar.open('Payment completed successfully', 'close', {
          verticalPosition: 'top',
          panelClass: 'success',
        });
      });
    }

    if (!this.config.errorCallback) {
      this.st.on('error', () => {
        this.snackBar.open('An error occurred', 'close', { verticalPosition: 'top', panelClass: 'error' });
      });
    }

    if (!this.config.submitCallback) {
      this.st.on('submit', data => {
        console.log(`This is what we have got after submit ${JSON.stringify(data)}`);
      });
    }
  }

  updateJwt(): void {
    if (this.pageOptions.updatedJwt) {
      this.st.updateJWT(this.pageOptions.updatedJwt);
    }
  }
}
