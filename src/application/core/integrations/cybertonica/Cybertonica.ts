import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { Service } from 'typedi';
import { IAFCybertonica } from './IAFCybertonica';
import { environment } from '../../../../environments/environment';
import { ICybertonica } from './ICybertonica';
import { from, Observable, of, ReplaySubject, timeout } from 'rxjs';
import { catchError, map, mapTo } from 'rxjs/operators';
import { IFraudControlDataProvider } from '../../services/fraud-control/IFraudControlDataProvider';

declare const AFCYBERTONICA: IAFCybertonica;

@Service()
export class Cybertonica implements ICybertonica, IFraudControlDataProvider<string> {
  private static readonly SDK_ADDRESS = environment.CYBERTONICA.CYBERTONICA_LIVE_URL;
  private static SCRIPT_TARGET = 'head';
  private static TID_TIMEOUT = 5000;

  private static getBasename(): string {
    const link = document.createElement('a');
    link.href = Cybertonica.SDK_ADDRESS;
    return 'https://' + link.hostname;
  }

  private tid: ReplaySubject<string | null> = new ReplaySubject<string | null>(1);
  private initialized = false;

  init(apiUserName: string): Observable<void> {
    if (!this.initialized) {
      this.initialized = true;
      this.initializeCybertonica(apiUserName).pipe(
        catchError(() => of(null)),
        timeout({ each: Cybertonica.TID_TIMEOUT, with: () => of(null) }),
      ).subscribe(tid => this.tid.next(tid));
    }

    return this.tid.pipe(mapTo(undefined));
  }

  getTransactionId(): Observable<string | null> {
    return this.tid.asObservable();
  }

  private initializeCybertonica(apiUserName: string): Observable<string | null> {
    if (!apiUserName || apiUserName === '') {
      return of(null);
    }

    return this.insertCybertonicaLibrary().pipe(
      map(() => AFCYBERTONICA.init(apiUserName, undefined, Cybertonica.getBasename()) || null),
    );
  }

  private insertCybertonicaLibrary(): Observable<Element> {
    return from(DomMethods.insertScript(Cybertonica.SCRIPT_TARGET, { src: Cybertonica.SDK_ADDRESS }));
  }
}
