import { Observable, switchMap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Service } from 'typedi';
import { ISrcProvider } from '../ISrcProvider';
import { ISrc } from '../ISrc';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { environment } from '../../../../environments/environment';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { SrcName } from '../SrcName';
import { SrcProviderToken } from '../../../../client/dependency-injection/InjectionTokens';

@Service({ id: SrcProviderToken, multiple: true })
export class VisaSrcProvider implements ISrcProvider {
  private sdkUrl: Observable<string>;
  private src: Observable<ISrc>;

  constructor(private configProvider: ConfigProvider) {
    this.sdkUrl = configProvider.getConfig$().pipe(
      map(config => {
        const { PROD, SANDBOX } = environment.CLICK_TO_PAY.VISA.SRC_SDK_URL;

        return config.livestatus ? PROD : SANDBOX;
      }),
    );
    this.src = this.sdkUrl.pipe(
      switchMap(sdkUrl => DomMethods.insertScript('head', { src: sdkUrl })),
      map(() => {
        // @ts-ignore
        const vSrcAdapter = window.vAdapters.VisaSRCI;
        const vSrc: ISrc = new vSrcAdapter();

        return vSrc;
      }),
      shareReplay(1),
    );
  }

  getSrcName(): SrcName {
    return SrcName.VISA;
  }

  getSrc(): Observable<ISrc> {
    return this.src;
  }
}
