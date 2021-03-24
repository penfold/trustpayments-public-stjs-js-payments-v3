import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { IConfig } from '../../../shared/model/config/IConfig';
import { IGooglePaymentMethodName } from '../models/IGooglePaymentMethod';

@Service({ id: PaymentMethodToken, multiple: true })
export class GooglePaymentMethod implements IPaymentMethod {
  getName(): string {
    return IGooglePaymentMethodName;
  }

  init(config: IConfig): Observable<void> {
    return of(undefined);
  }

  start(data: any): Observable<IPaymentResult<any>> {
    switch (data.resultStatus) {
      case PaymentStatus.SUCCESS:
        return of({
          status: data.resultStatus,
          data: {}
        });
      case PaymentStatus.CANCEL:
        return of({
          status: data.resultStatus,
          data: {}
        });
      case PaymentStatus.FAILURE:
        return of({
          status: data.resultStatus,
          error: {
            code: 500,
            message: 'Payment failed'
          },
          data: {}
        });
    }
  }
}
