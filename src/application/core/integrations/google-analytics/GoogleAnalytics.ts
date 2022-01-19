import { Service } from 'typedi';
import { EMPTY, interval, Observable, switchMap, throwError } from 'rxjs';
import { catchError, filter, first, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { SentryService } from '../../../../shared/services/sentry/SentryService';

interface GA {
  (type: string, data: unknown): void;
}

@Service()
export class GoogleAnalytics {
  private ga: Observable<GA>;

  constructor(private sentryService: SentryService) {
  }

  init(): void {
    this.ga = this.insertGALibrary().pipe(
      map(() => this.createGAScript()),
      switchMap(gaScript => this.insertGAScript(gaScript)),
      catchError(error => throwError(() => new Error(error))),
    );
  }

  sendGaData(hitType: string, eventCategory: string, eventAction: string, eventLabel: string): void {
    this.ga.subscribe(ga => ga('send', { hitType, eventCategory, eventAction, eventLabel }));
  }

  private createGAScript(): HTMLScriptElement {
    const gaScriptContent = document.createTextNode(this.returnScriptWithFeatures());
    const gaScript = document.createElement('script');
    gaScript.type = 'text/javascript';
    gaScript.id = 'googleAnalytics';
    gaScript.appendChild(gaScriptContent);

    return gaScript;
  }

  private returnScriptWithFeatures(): string {
    return `window.ga=window.ga||function(){(ga.q=ga.q||[]).
    push(arguments)};ga.l=+new Date;
    ga('create', 'UA-${environment.GA_MEASUREMENT_ID}', {'storage': 'none'});
    ga('set', 'anonymizeIp', true);
    ga('set', 'allowAdFeatures', false);
    ga('send', 'pageview', location.pathname);`;
  }

  private insertGALibrary(): Observable<HTMLScriptElement> {
    return DomMethods.insertScript('head', { async: 'async', src: environment.GA_SCRIPT_SRC }).pipe(
      this.sentryService.captureAndReportResourceLoadingTimeout('Google Analytics script load timeout'),
      catchError(() => EMPTY)
    );
  }

  private insertGAScript(gaScript: HTMLScriptElement): Observable<GA> {
    if (!document.getElementById('googleAnalytics')) {
      document.head.appendChild(gaScript);
    }

    return interval().pipe(
      // @ts-ignore
      map(() => window?.ga?.loaded),
      filter(Boolean),
      first(),
      shareReplay(1),
    );
  }
}
