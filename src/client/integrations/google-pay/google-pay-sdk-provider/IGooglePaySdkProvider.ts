import { Observable } from 'rxjs';
import { IGooglePaySessionPaymentsClient } from '../../../../integrations/google-pay/models/IGooglePayPaymentsClient';
import { IConfig } from '../../../../shared/model/config/IConfig';

export abstract class IGooglePaySdkProvider {
  abstract setupSdk$(config: IConfig): Observable<IGooglePaySessionPaymentsClient>;
}
