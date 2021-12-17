import { Inject, Service } from 'typedi';
import { Observable, of, ReplaySubject, timeout } from 'rxjs';
import { catchError, map, mapTo, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { IFraudControlDataProvider } from '../../services/fraud-control/IFraudControlDataProvider';
import { WINDOW } from '../../../../shared/dependency-injection/InjectionTokens';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { ICybertonica } from './ICybertonica';

@Service()
export class Cybertonica implements ICybertonica, IFraudControlDataProvider {
  private static readonly SDK_ADDRESS = environment.CYBERTONICA.CYBERTONICA_LIVE_URL;
  private static SCRIPT_TARGET = 'head';
  private static TID_TIMEOUT = 5000;

  private static getBasename(): string {
    const link = new URL(Cybertonica.SDK_ADDRESS);

    return 'https://' + link.hostname;
  }

  private tid: ReplaySubject<string | null> = new ReplaySubject<string | null>(1);
  private initialized = false;

  constructor(@Inject(WINDOW) private window: Window, private configProvider: ConfigProvider, private sentryService: SentryService) {
  }

  init(): Observable<undefined> {
    if (!this.initialized) {
      this.initialized = true;
      this.configProvider.getConfig$().pipe(
        switchMap(config => this.initializeCybertonica(config.cybertonicaApiKey)),
        catchError(() => of(null)),
        timeout({ each: Cybertonica.TID_TIMEOUT, with: () => of(null) }),
      ).subscribe(tid => {
        this.tid.next(tid);
        this.tid.complete();
      });
    }

    return this.tid.pipe(mapTo(undefined));
  }

  getTransactionId(): Observable<string | null> {
    return this.tid.asObservable();
  }

  private initializeCybertonica(apiUserName: string): Observable<string | null> {
    if (!apiUserName) {
      return of(null);
    }

    return this.insertCybertonicaLibrary().pipe(
      map(() => this.window.AFCYBERTONICA?.init(apiUserName, undefined, Cybertonica.getBasename()) || null)
    );
  }

  private insertCybertonicaLibrary(): Observable<Element> {
    return DomMethods.insertScript(Cybertonica.SCRIPT_TARGET, { src: Cybertonica.SDK_ADDRESS }).pipe(
      this.sentryService.captureAndReportResourceLoadingTimeout('Cybertonica script load timeout')
    );
  }
}
