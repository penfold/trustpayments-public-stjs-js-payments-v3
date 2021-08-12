import { Observable } from 'rxjs';
import { ApplePayClientStatus } from './ApplePayClientStatus';

export interface IApplePayClient {
  init$(): Observable<ApplePayClientStatus>;
}
