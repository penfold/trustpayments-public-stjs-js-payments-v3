import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { Service } from 'typedi';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { Observable } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { IStore } from '../../store/IStore';
import { IApplicationFrameState } from '../../store/state/IApplicationFrameState';
import { IParentFrameState } from '../../store/state/IParentFrameState';

type CommonState = IApplicationFrameState | IParentFrameState;

@Service()
export class StoreConfigProvider implements ConfigProvider {
  constructor(private store: IStore<CommonState>) {}

  getConfig(): IConfig {
    return this.store.getState().config;
  }

  getConfig$(watchForChanges?: boolean): Observable<IConfig> {
    const config$: Observable<IConfig> = this.store.select(state => state.config).pipe(filter<IConfig>(Boolean));

    return watchForChanges ? config$ : config$.pipe(first());
  }
}
