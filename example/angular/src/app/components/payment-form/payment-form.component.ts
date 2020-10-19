import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPageOptions } from '../../services/page-options.interface';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

declare const SecureTrading: any;

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements AfterViewInit, OnDestroy {
  @Input() config: any;
  @Input() pageOptions: IPageOptions;
  private updateJwt$: Subject<string> = new Subject();
  private destroy$: Subject<void> = new Subject();

  constructor(private snackBar: MatSnackBar) {}

  ngAfterViewInit(): void {
    const st: any = SecureTrading(this.config);
    st.Components(this.config.components);
    st.VisaCheckout(this.config.visaCheckout);
    st.ApplePay(this.config.applePay);

    if (!this.config.successCallback) {
      st.on('success', () => {
        this.snackBar.open('Payment completed successfully', 'close', {
          verticalPosition: 'top',
          panelClass: 'success'
        });
      });
    }

    if (!this.config.errorCallback) {
      st.on('error', () => {
        this.snackBar.open('An error occurred', 'close', { verticalPosition: 'top', panelClass: 'error' });
      });
    }

    if (!this.config.submitCallback) {
      st.on('submit', data => {
        console.log(`This is what we have got after submit ${JSON.stringify(data)}`);
      });
    }

    this.updateJwt$
      .pipe(filter(Boolean), debounceTime(900), takeUntil(this.destroy$))
      .subscribe(jwt => st.updateJWT(jwt));
  }

  updateJwt(): void {
    this.updateJwt$.next(this.pageOptions.updatedJwt);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
