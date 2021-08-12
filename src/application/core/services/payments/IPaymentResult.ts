import { PaymentStatus } from './PaymentStatus';
import { IPaymentError } from './IPaymentError';

export interface IPaymentResult<T> {
  status: PaymentStatus;
  data?: T;
  error?: IPaymentError;
}
