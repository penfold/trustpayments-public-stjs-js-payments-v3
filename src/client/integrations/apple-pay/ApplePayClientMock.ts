import { Observable, of } from 'rxjs';
import { ApplePayClientStatus } from './ApplePayClientStatus';
import { IApplePayClient } from './IApplePayClient';

export class ApplePayClientMock implements IApplePayClient {
  init$(): Observable<ApplePayClientStatus> {
    return of(ApplePayClientStatus.SUCCESS);
  }
}
