import { Observable } from 'rxjs';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { switchMap } from 'rxjs/operators';

export class ApplePayClient {
  private readonly config$: Observable<IConfig>;

  constructor(private configProvider: ConfigProvider) {
    this.config$ = this.configProvider.getConfig$();
  }

  init$(): Observable<any> {
    return this.config$.pipe(
      switchMap((config: IConfig) => {
        return config;
      })
    );
  }
}
