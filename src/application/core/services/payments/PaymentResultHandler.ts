import { IPaymentResult } from './IPaymentResult';
import { Debug } from '../../../../shared/Debug';
import { Service } from 'typedi';

@Service()
export class PaymentResultHandler {
  handle<T>(result: IPaymentResult<T>): void {
    Debug.log('Payment result: ', result);
  }
}
