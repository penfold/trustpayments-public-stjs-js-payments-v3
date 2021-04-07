import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { IGooglePaymentMethodName } from '../models/IGooglePaymentMethod';
import { TransportService } from '../../../application/core/services/st-transport/TransportService';
import { map } from 'rxjs/operators';

@Service({ id: PaymentMethodToken, multiple: true })
export class GooglePaymentMethod implements IPaymentMethod {
  constructor(private transportService: TransportService) {}

  getName(): string {
    return IGooglePaymentMethodName;
  }

  init(): Observable<void> {
    return of(undefined);
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
