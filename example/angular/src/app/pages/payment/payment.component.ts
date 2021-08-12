import { Component } from '@angular/core';
import { SecureTradingLoader } from '../../services/secure-trading-loader.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PageOptionsResolver } from '../../services/page-options-resolver.service';
import { IPageOptions } from '../../services/page-options.interface';
import { ConfigResolver } from '../../services/config-resolver.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
  readonly pageOptions: IPageOptions;
  readonly config$: Observable<any>;

  constructor(
    private secureTradingLoader: SecureTradingLoader,
    private pageOptionsResolver: PageOptionsResolver,
    private configResolver: ConfigResolver
  ) {
    this.pageOptions = this.pageOptionsResolver.resolve();
    this.config$ = this.secureTradingLoader
      .load()
      .pipe(switchMap(() => this.configResolver.resolve(this.pageOptions.configUrl, this.pageOptions)));
  }
}
