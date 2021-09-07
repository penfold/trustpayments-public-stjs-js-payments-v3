import { environment } from '../../../../environments/environment';
import { DomMethods } from '../../shared/dom-methods/DomMethods';

export class GoogleAnalytics {
  static sendGaData(hitType: string, eventCategory: string, eventAction: string, eventLabel: string): void | boolean {
    // @ts-ignore
    if (window.ga) {
      // @ts-ignore
      window.ga('send', { hitType, eventCategory, eventAction, eventLabel });
    } else {
      return false;
    }
  }

  private static GA_MEASUREMENT_ID: string = environment.GA_MEASUREMENT_ID;
  private static GA_INIT_SCRIPT_CONTENT = `window.ga=window.ga||function(){(ga.q=ga.q||[]).
  push(arguments)};ga.l=+new Date;
`;
  private static GA_SCRIPT_SRC: string = environment.GA_SCRIPT_SRC;
  private static GA_DISABLE_COOKIES = `ga('create', 'UA-${GoogleAnalytics.GA_MEASUREMENT_ID}'
  , {'storage': 'none'});`;
  private static GA_IP_ANONYMIZATION = 'ga(\'set\', \'anonymizeIp\', true);';
  private static GA_DISABLE_ADVERTISING_FEATURES = 'ga(\'set\', \'allowAdFeatures\', false);';
  private static GA_PAGE_VIEW = 'ga(\'send\', \'pageview\', location.pathname);';
  private static TRANSLATION_SCRIPT_SUCCEEDED = 'Google Analytics: script has been created';
  private static TRANSLATION_SCRIPT_FAILED = 'Google Analytics: an error occurred loading script';
  private static TRANSLATION_SCRIPT_APPENDED = 'Google Analytics: script has been appended';
  private static TRANSLATION_SCRIPT_APPENDED_FAILURE = 'Google Analytics: an error occurred appending script';
  private static disableUserIDTracking(): boolean {
    // @ts-ignore
    return (window[`ga-disable-UA-${GoogleAnalytics.GA_MEASUREMENT_ID}-Y`] = true);
  }

  private static returnScriptWithFeatures(): string {
    return `${GoogleAnalytics.GA_INIT_SCRIPT_CONTENT}
    ${GoogleAnalytics.GA_DISABLE_COOKIES}
    ${GoogleAnalytics.GA_IP_ANONYMIZATION}
    ${GoogleAnalytics.GA_DISABLE_ADVERTISING_FEATURES}
    ${GoogleAnalytics.GA_PAGE_VIEW}`;
  }

  private communicate: string;
  private gaScript: HTMLScriptElement;
  private gaScriptContent: Text;

  init(): void {
    this.insertGALibrary();
    this.createGAScript()
      .then(() => {
        this.insertGAScript()
          .then(() => {
            GoogleAnalytics.disableUserIDTracking();
          })
          .catch(error => {
            throw new Error(error);
          });
      })
      .catch(error => {
        throw new Error(error);
      });
  }

  private createGAScript(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.gaScript = document.createElement('script');
      this.gaScript.type = 'text/javascript';
      this.gaScript.id = 'googleAnalytics';
      this.gaScriptContent = document.createTextNode(GoogleAnalytics.returnScriptWithFeatures());
      this.gaScript.appendChild(this.gaScriptContent);
      resolve((this.communicate = GoogleAnalytics.TRANSLATION_SCRIPT_SUCCEEDED));
      reject((this.communicate = GoogleAnalytics.TRANSLATION_SCRIPT_FAILED));
    });
  }

  private insertGALibrary(): void {
    DomMethods.insertScript('head', { async: 'async', src: GoogleAnalytics.GA_SCRIPT_SRC, id: 'googleAnalytics' });
  }

  private insertGAScript(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!document.getElementById('googleAnalytics')) {
        document.head.appendChild(this.gaScript);
        resolve((this.communicate = GoogleAnalytics.TRANSLATION_SCRIPT_APPENDED));
        reject((this.communicate = GoogleAnalytics.TRANSLATION_SCRIPT_APPENDED_FAILURE));
      }
    });
  }
}
