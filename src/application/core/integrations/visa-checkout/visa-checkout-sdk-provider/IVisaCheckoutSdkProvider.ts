import { Observable } from 'rxjs';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { IVisaCheckoutSdk } from './IVisaCheckoutSdk';

export interface IVisaCheckoutSdkProvider {
  getSdk$(config: IConfig): Observable<IVisaCheckoutSdk>;
}
