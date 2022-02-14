import { Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Service } from 'typedi';
import { ISrcProvider } from '../ISrcProvider';
import { ISrc } from '../ISrc';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { environment } from '../../../../environments/environment';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { SrcName } from '../SrcName';

@Service()
export class VisaSrcProvider implements ISrcProvider {
  private sdkUrl: Observable<string>;

  constructor(private configProvider: ConfigProvider) {
    this.sdkUrl = configProvider.getConfig$().pipe(
      map(config => {
        const { PROD, SANDBOX } = environment.CLICK_TO_PAY.VISA.SRC_SDK_URL;

        return config.livestatus ? PROD : SANDBOX;
      }),
    );
  }

  getSrcName(): SrcName {
    return SrcName.VISA;
  }

  getSrc(): Observable<ISrc> {
    return this.sdkUrl.pipe(
      switchMap(sdkUrl => DomMethods.insertScript('head', { src: sdkUrl })),
      map(() => {
        // @ts-ignore
        const vSrcAdapter = window.vAdapters.VisaSRCI;
        const vSrc: ISrc = new vSrcAdapter();

        return vSrc;
      }),
    );
  }
}
