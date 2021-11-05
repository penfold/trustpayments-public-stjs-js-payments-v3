import { Service } from 'typedi';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, first, shareReplay } from 'rxjs/operators';
import { IConfig } from '../../model/config/IConfig';
import { ConfigProvider } from '../config-provider/ConfigProvider';
import { BrowserLocalStorage } from './BrowserLocalStorage';

@Service()
export class StorageConfigProvider implements ConfigProvider {
  private static readonly STORAGE_KEY = 'app.config-provider';

  constructor(private storage: BrowserLocalStorage) {}

  getConfig(): IConfig {
    return this.storage.getItem(StorageConfigProvider.STORAGE_KEY);
  }

  getConfig$(watchForChanges = false): Observable<IConfig> {
    const config$ = this.storage
      .select(storage => storage[StorageConfigProvider.STORAGE_KEY])
      .pipe(distinctUntilChanged(), filter<IConfig>(Boolean), shareReplay(1));

    return watchForChanges ? config$ : config$.pipe(first());
  }
}
