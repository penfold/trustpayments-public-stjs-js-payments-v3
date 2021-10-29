import { IFraudControlDataProvider } from '../../services/fraud-control/IFraudControlDataProvider';
import { from, Observable, of, switchMap } from 'rxjs';
import { Service } from 'typedi';
import { environment } from '../../../../environments/environment';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { Uuid } from '../../../core/shared/uuid/Uuid';

@Service()
export class Seon implements IFraudControlDataProvider<undefined> {
  init(): Observable<void> {
    return this.insertSeonLibrary().pipe(
      switchMap(() => this.configureSeon()),
    );
  }

  getTransactionId(): Observable<string | null> {
    return new Observable(observer => {
      // @ts-ignore
      window.seon.getBase64Session((data: string) => {
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
      // @ts-ignore
      window.seon.config({
        host: this.getHostname(),
        session_id: Uuid.uuidv4(),
        audio_fingerprint: true,
        canvas_fingerprint: true,
        webgl_fingerprint: true,
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
