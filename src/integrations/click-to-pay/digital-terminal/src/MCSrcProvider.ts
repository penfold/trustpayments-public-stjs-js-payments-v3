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
export class MasterCardSrcProvider implements ISrcProvider {
  private sdkUrl: Observable<string>;
  private src: Observable<ISrc>;

  constructor(private configProvider: ConfigProvider) {
    this.sdkUrl = this.configProvider.getConfig$().pipe(
      map(config => {
        const { PROD, SANDBOX } = environment.CLICK_TO_PAY.MASTERCARD.SRC_SDK_URL;

        return config.livestatus ? PROD : SANDBOX;
      }),
    );
    this.src = this.sdkUrl.pipe(
      switchMap(sdkUrl => DomMethods.insertScript('head', { src: sdkUrl })),
      map(() => {
        // @ts-ignore
        const mcSrcAdapter = window.SRCSDK_MASTERCARD;
        const mcSrc: ISrc = new mcSrcAdapter();

        return mcSrc;
      }),
      shareReplay(1),
    );
  }

  getSrcName(): SrcName {
    return SrcName.MASTERCARD;
  }

  getSrc(): Observable<ISrc> {
    return this.src;
  }
}
