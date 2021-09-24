import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { Service } from 'typedi';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { Observable, of } from 'rxjs';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ITestResultData } from './interfaces/ITestResultData';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { ITestStartData } from './interfaces/ITestStartData';

@Service({ id: PaymentMethodToken, multiple: true })
export class TestPaymentMethod implements IPaymentMethod<IConfig, ITestStartData, ITestResultData> {
  getName(): string {
    return 'test';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  init(config: IConfig): Observable<void> {
    return of(undefined);
  }

  start(data: ITestStartData): Observable<IPaymentResult<ITestResultData>> {
    switch (data.resultStatus) {
      case PaymentStatus.SUCCESS:
        return of({
          status: data.resultStatus,
          data: {
            baz: 'baz',
            xyz: 'xyz',
            jwt: 'jwt',
            threedresponse: 'threedresponse',
          },
          paymentMethodName: 'Test',
        });
      case PaymentStatus.CANCEL:
        return of({
          status: data.resultStatus,
          data: {
            xyz: 'xyz',
            baz: 'baz',
          },
          paymentMethodName: 'Test',
        });
      case PaymentStatus.FAILURE:
        return of({
          status: data.resultStatus,
          error: {
            code: 123,
            message: 'payment failed',
          },
          data: {
            baz: 'baz',
            xyz: 'xyz',
          },
          paymentMethodName: 'Test',
        });
      case PaymentStatus.ERROR:
        return of({
          status: data.resultStatus,
          data: {
            baz: 'baz',
            xyz: 'xyz',
          },
          paymentMethodName: 'Test',
        });
    }
  }
}
