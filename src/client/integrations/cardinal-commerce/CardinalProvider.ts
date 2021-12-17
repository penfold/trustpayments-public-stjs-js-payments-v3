import { interval, Observable } from 'rxjs';
import { Service } from 'typedi';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { environment } from '../../../environments/environment';
import { ICardinal } from './ICardinal';
import { ICardinalProvider } from './ICardinalProvider';

@Service()
export class CardinalProvider implements ICardinalProvider {
  private static readonly SCRIPT_ID = 'cardinalCommerce';
  private static readonly CONTAINER_ID = 'Cardinal-ElementContainer';

  getCardinal$(liveStatus: boolean): Observable<ICardinal> {
    const sdkAddress = liveStatus
      ? environment.CARDINAL_COMMERCE.SONGBIRD_LIVE_URL
      : environment.CARDINAL_COMMERCE.SONGBIRD_TEST_URL;

    const scriptOptions = {
      src: sdkAddress,
      id: CardinalProvider.SCRIPT_ID,
    };

    const mobileViewStyles = `
      @media only screen and (max-width: 450px) {
        #${CardinalProvider.CONTAINER_ID} iframe#Cardinal-CCA-IFrame {
          width: 100vw;
        }
      }
    `;

    DomMethods.insertStyle(mobileViewStyles);

    return DomMethods.insertScript('head', scriptOptions).pipe(
      switchMap(this.waitForCardinalInit)
    );
  }

  private waitForCardinalInit(): Observable<ICardinal> {
    return interval().pipe(
      // @ts-ignore
      map(() => window.Cardinal),
      filter(Boolean),
      first()
    ) as Observable<ICardinal>;
  }
}
