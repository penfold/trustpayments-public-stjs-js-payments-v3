import { AfterViewInit, Component, Input } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { jwtgenerator } from '@trustpayments/jwt-generator';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SecureTradingService } from '../../services/secure-trading.service';

interface Option {
  value: string;
  name: string;
}

@Component({
  selector: 'app-tokenized-card-payment-form',
  templateUrl: './tokenized-card-payment-form.component.html',
})
export class TokenizedCardPaymentFormComponent implements AfterViewInit {
  @Input() config: any;
  private adapterInstance: any;
  cardList: Option[] = [{
    value: 'card1',
    name: 'VISA',
  },
    {
      value: 'card2',
      name: 'MASTERCARD',
    }];
  selectValue: string;

  constructor(private secureTradingService: SecureTradingService,
              protected httpClient: HttpClient) {
    this.selectValue = this.cardList[0].value;
  }

  ngAfterViewInit(): void {
    this.getJWT(this.cardList[0].value).pipe(
      switchMap((jwt) => {
        return from(this.secureTradingService.initTokenizedCardPayment(jwt, this.config));
      })
    ).subscribe((adapter) => {
      this.adapterInstance = adapter;
    });
  }

  updateJWT(card: string): void {
    this.selectValue = card;
    this.getJWT(card).subscribe((jwt) => {
      this.adapterInstance.updateTokenizedJWT(jwt);
    });
  }

  private getJWT(card: string): Observable<any> {
    return this.httpClient.get(environment.jwtTokenizedUrl(card))
      .pipe(map((response: any) => jwtgenerator(response.payload, response.secret, response.iss)));
  }

}
