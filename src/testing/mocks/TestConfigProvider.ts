import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../shared/model/config/IConfig';
import { BehaviorSubject, Observable } from 'rxjs';
import { Service } from 'typedi';
import { DefaultConfig } from '../../application/core/models/constants/config-resolver/DefaultConfig';

@Service()
export class TestConfigProvider implements ConfigProvider {
  private static readonly SAMPLE_JWT =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTYwNzAxMTgwMy43ODUyNjY5LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsInJlcXVlc3R0eXBlZGVzY3JpcHRpb25zIjpbIlRIUkVFRFFVRVJZIl0sInRocmVlZGJ5cGFzc2NhcmRzIjpbIlBJQkEiXX19.641dyecUWIe5sHCBZpYEFoVK-nSbviobPDAMpB_IyFM';
  private config$: BehaviorSubject<IConfig> = new BehaviorSubject({
    ...DefaultConfig,
    jwt: TestConfigProvider.SAMPLE_JWT
  });

  getConfig(): IConfig {
    return this.config$.getValue();
  }

  getConfig$(watchForChanges?: boolean): Observable<IConfig> {
    return this.config$.asObservable();
  }

  setConfig(config: IConfig): void {
    this.config$.next(config);
  }
}
