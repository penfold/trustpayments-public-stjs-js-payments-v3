import { Observable } from 'rxjs';
import { IConfig } from '../../../../../shared/model/config/IConfig';
import { IVisaCheckoutUpdateConfig } from '../visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { IVisaCheckoutSdk } from './IVisaCheckoutSdk';

export interface IVisaCheckoutSdkProvider {
  getSdk$(config: IConfig, visaCheckoutUpdateConfig: IVisaCheckoutUpdateConfig): Observable<IVisaCheckoutSdk>;
}
