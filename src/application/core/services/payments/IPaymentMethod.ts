import { Observable } from 'rxjs';
import { IPaymentResult } from './IPaymentResult';

export interface IPaymentMethod<TConfig = unknown, TData = unknown, TResult = unknown> {
  getName(): string;
  init(config: TConfig): Observable<void>;
  start(data: TData): Observable<IPaymentResult<TResult>>;
}
