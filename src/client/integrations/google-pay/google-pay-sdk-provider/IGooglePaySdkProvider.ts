import { Observable } from 'rxjs';
import { IGooglePaySessionPaymentsClient } from '../../../../integrations/google-pay/models/IGooglePayPaymentsClient';
import { IConfig } from '../../../../shared/model/config/IConfig';

export interface IGooglePaySdkProvider {
  setupSdk$(config: IConfig): Observable<IGooglePaySessionPaymentsClient>;
}
