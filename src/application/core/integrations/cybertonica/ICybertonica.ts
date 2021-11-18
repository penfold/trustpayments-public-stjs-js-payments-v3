import { Observable } from 'rxjs';

export interface ICybertonica {
  init(apiUserName: string): Observable<void>;
  getTransactionId(): Observable<string | null>;
}
