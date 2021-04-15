import { Observable, of, EMPTY } from 'rxjs';
import { Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { GooglePaymentMethodName } from '../models/IGooglePaymentMethod';
import { TransportService } from '../../../application/core/services/st-transport/TransportService';
import { map } from 'rxjs/operators';

@Service({ id: PaymentMethodToken, multiple: true })
export class GooglePaymentMethod implements IPaymentMethod {
  constructor(private transportService: TransportService) {}

  getName(): string {
    return GooglePaymentMethodName;
  }

  init(): Observable<void> {
    return EMPTY;
  }

  start(data: any): Observable<IPaymentResult<any>> {
    return this.transportService.sendRequest(data).pipe(
      map((response: any) => ({
        status: data.resultStatus,
        data: response
      }))
    );
  }
}
