import { Observable } from 'rxjs';
import { IPaymentResult } from './IPaymentResult';

export interface IPaymentMethod<C = any, D = any, T = any> {
  getName(): string;
  init(config: C): Observable<void>;
  start(data: D): Observable<IPaymentResult<T>>;
}
