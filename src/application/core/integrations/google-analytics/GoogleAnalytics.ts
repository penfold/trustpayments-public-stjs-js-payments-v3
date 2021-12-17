import { Service } from 'typedi';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { SentryService } from '../../../../shared/services/sentry/SentryService';

@Service()
export class GoogleAnalytics {
  private communicate: string;
  private gaScript: HTMLScriptElement;
  private gaScriptContent: Text;

  constructor(private sentryService: SentryService) {
  }

  init(): void {
    this.insertGALibrary();
    this.createGAScript()
      .then(() => {
        this.insertGAScript()
          .then(() => {
            return (window[`ga-disable-UA-${environment.GA_MEASUREMENT_ID}-Y`] = true);
          })
          .catch(error => {
            throw new Error(error);
          });
      })
      .catch(error => {
        throw new Error(error);
      });
  }

  sendGaData(hitType: string, eventCategory: string, eventAction: string, eventLabel: string): void | boolean {
    // @ts-ignore
    if (window.ga) {
      // @ts-ignore
      window.ga('send', { hitType, eventCategory, eventAction, eventLabel });
    } else {
      return false;
    }
  }

  private createGAScript(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gaScript = document.createElement('script');
      this.gaScript.type = 'text/javascript';
      this.gaScript.id = 'googleAnalytics';
      this.gaScriptContent = document.createTextNode(this.returnScriptWithFeatures());
      this.gaScript.appendChild(this.gaScriptContent);
      resolve((this.communicate = 'Google Analytics: script has been created'));
      reject((this.communicate = 'Google Analytics: an error occurred loading script'));
    });
  }

  private returnScriptWithFeatures(): string {
    return `window.ga=window.ga||function(){(ga.q=ga.q||[]).
    push(arguments)};ga.l=+new Date;
    ga('create', 'UA-${environment.GA_MEASUREMENT_ID}', {'storage': 'none'});
    ga('set', 'anonymizeIp', true);
    ga('set', 'allowAdFeatures', false);
    ga('send', 'pageview', location.pathname);`;
  }

  private insertGALibrary(): void {
    DomMethods.insertScript('head', { async: 'async', src: environment.GA_SCRIPT_SRC, id: 'googleAnalytics' }).pipe(
      this.sentryService.captureAndReportResourceLoadingTimeout('Google Analytics script load timeout'),
      catchError(() => of(null))
    ).subscribe();
  }

  private insertGAScript(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!document.getElementById('googleAnalytics')) {
        document.head.appendChild(this.gaScript);
        resolve((this.communicate = 'Google Analytics: script has been appended'));
        reject((this.communicate = 'Google Analytics: an error occurred appending script'));
      }
    });
  }
}
