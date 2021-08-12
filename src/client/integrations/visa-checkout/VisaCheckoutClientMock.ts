import { Observable, of } from 'rxjs';
import { IVisaCheckoutClient } from './IVisaCheckoutClient';
import { VisaCheckoutClientStatus } from './VisaCheckoutClientStatus';

export class VisaCheckoutClientMock implements IVisaCheckoutClient {
  init$(): Observable<VisaCheckoutClientStatus> {
    return of(VisaCheckoutClientStatus.SUCCESS);
  }

  watchConfigAndJwtUpdates(): void {}
}
