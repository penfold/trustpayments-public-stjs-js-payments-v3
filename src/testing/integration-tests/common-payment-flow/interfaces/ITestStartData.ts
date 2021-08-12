import { PaymentStatus } from '../../../../application/core/services/payments/PaymentStatus';

export interface ITestStartData {
  foo: string;
  bar: string;
  resultStatus: PaymentStatus;
}
