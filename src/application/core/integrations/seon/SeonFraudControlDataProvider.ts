import { IFraudControlDataProvider } from '../../services/fraud-control/IFraudControlDataProvider';
import { from, Observable, switchMap } from 'rxjs';
import { Inject, Service } from 'typedi';
import { environment } from '../../../../environments/environment';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { Uuid } from '../../shared/uuid/Uuid';
import { WINDOW } from '../../../../shared/dependency-injection/InjectionTokens';
import { shareReplay } from 'rxjs/operators';

@Service()
export class SeonFraudControlDataProvider implements IFraudControlDataProvider<undefined> {
  private initResult: Observable<void>;

  constructor(@Inject(WINDOW) private window: Window) {
  }

  init(): Observable<void> {
    if (!this.initResult) {
      this.initResult = this.insertSeonLibrary().pipe(
        switchMap(() => this.configureSeon()),
        shareReplay(1),
      );
    }

    return this.initResult;
  }

  getTransactionId(): Observable<string | null> {
    return new Observable(observer => {
      this.window.seon.getBase64Session((data: string | null) => {
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

  private configureSeon(): Observable<void> {
    return new Observable(observer => {
      this.window.seon.config({
        host: this.getHostname(),
        session_id: Uuid.uuidv4(),
        audio_fingerprint: true,
        canvas_fingerprint: true,
        webgl_fingerprint: false,
        onSuccess: () => {
          observer.next(undefined);
          observer.complete();
        },
        onError: (message: string) => observer.error(new Error(message)),
      });
    });
  }

  private getHostname(): string {
    const link = document.createElement('a');
    link.href = environment.SEON.LIBRARY_URL;

    return link.hostname;
  }
}
