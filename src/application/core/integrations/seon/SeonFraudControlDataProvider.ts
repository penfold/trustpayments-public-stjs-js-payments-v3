import { from, Observable, switchMap } from 'rxjs';
import { Inject, Service } from 'typedi';
import { shareReplay, tap } from 'rxjs/operators';
import { IFraudControlDataProvider } from '../../services/fraud-control/IFraudControlDataProvider';
import { environment } from '../../../../environments/environment';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { Uuid } from '../../shared/uuid/Uuid';
import { WINDOW } from '../../../../shared/dependency-injection/InjectionTokens';
import { FrameIdentifier } from '../../../../shared/services/message-bus/FrameIdentifier';
import { BrowserDetector } from '../../../../shared/services/browser-detector/BrowserDetector';

@Service()
export class SeonFraudControlDataProvider implements IFraudControlDataProvider {
  private initResult: Observable<undefined>;

  constructor(
    @Inject(WINDOW) private window: Window,
    private frameIdentifier: FrameIdentifier,
    private browserDetector: BrowserDetector,
  ) {
  }

  init(): Observable<undefined> {
    this.log('SEON INIT CALLED');
    if (!this.initResult) {
      this.log('INITIATING SEON');
      this.initResult = this.insertSeonLibrary().pipe(
        tap(() => {
          this.log('SEON INSERTED');
          this.log(this.window.seon);
        }),
        switchMap(() => this.configureSeon()),
        shareReplay(1),
      );
      this.removeObsoleteHtmlElements();
    }

    return this.initResult;
  }

  getTransactionId(): Observable<string | null> {
    this.log('GETTING SEON TRANSACTION DATA');
    return new Observable(observer => {
      this.window.seon.getBase64Session((data: string | null) => {
        this.log('SEON DATA');
        this.log(data);
        if (data) {
          observer.next(data);
          observer.complete();
        } else {
          console.warn('Failed to retrieve session data.');
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  private insertSeonLibrary(): Observable<Element> {
    return from(DomMethods.insertScript('head', { src: environment.SEON.LIBRARY_URL }));
  }

  private configureSeon(): Observable<undefined> {
    return new Observable(observer => {
      this.window.seon.config({
        host: this.getHostname(),
        session_id: Uuid.uuidv4(),
        audio_fingerprint: true,
        canvas_fingerprint: true,
        webgl_fingerprint: true,
        onSuccess: () => {
          this.log('SEON CONFIG SUCCESS');
          observer.next(undefined);
          observer.complete();
        },
        onError: (message: string) => {
          this.log('SEON CONFIG ERROR');
          this.log(message);
          observer.error(new Error(message));
        },
      });
    });
  }

  private getHostname(): string {
    const link = document.createElement('a');
    link.href = environment.SEON.LIBRARY_URL;

    return link.hostname;
  }

  private removeObsoleteHtmlElements(): void {
    if (!this.frameIdentifier.isParentFrame()) {
      return;
    }

    const browserInfo = this.browserDetector.getBrowserInfo();

    if (browserInfo.browser.name !== 'Internet Explorer') {
      return;
    }

    const observer = new MutationObserver(() => {
      const seonFont = document.getElementById('seon-font');
      const disconnectHighlighted = document.querySelector('.disconnect-highlighted');
      const ddgExtensionHide = document.querySelector('.ddg-extension-hide');

      if (seonFont && disconnectHighlighted && ddgExtensionHide) {
        const hiddenClassName = '__seon-hidden';
        seonFont.parentElement.classList.add(hiddenClassName);
        disconnectHighlighted.parentElement.classList.add(hiddenClassName);
        ddgExtensionHide.parentElement.classList.add(hiddenClassName);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
    });
  }

  // @ts-ignore
  private log(data: any): void { // eslint-disable-line
    const logs = document.getElementById('st-log-area') as HTMLTextAreaElement;

    console.log(data);

    if (logs) {
      logs.value += JSON.stringify(data) + '\n';
    }
  }
}
