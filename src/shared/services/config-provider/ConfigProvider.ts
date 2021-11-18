import { Observable } from 'rxjs';
import { Service } from 'typedi';
import { IConfig } from '../../model/config/IConfig';

@Service()
export abstract class ConfigProvider {
  abstract getConfig(): IConfig;
  abstract getConfig$(watchForChanges?: boolean): Observable<IConfig>;
}
