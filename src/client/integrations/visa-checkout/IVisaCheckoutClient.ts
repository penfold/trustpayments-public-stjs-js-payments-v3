import { Observable } from 'rxjs';
import { VisaCheckoutClientStatus } from './VisaCheckoutClientStatus';

export interface IVisaCheckoutClient {
  init$(): Observable<VisaCheckoutClientStatus>;
}
