import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { shareReplay } from 'rxjs/operators';

type SecureTradingFactory = (config: any) => any;

declare const SecureTrading: SecureTradingFactory;

@Injectable({ providedIn: 'root' })
export class SecureTradingLoader {
  private script$: Observable<SecureTradingFactory>;

  public load(): Observable<SecureTradingFactory> {
    if (!this.script$) {
      this.script$ = new Observable<SecureTradingFactory>(observer => {
        const script = document.createElement('script');
        const onLoadHandler = () => {
          observer.next(SecureTrading);
          script.removeEventListener('load', onLoadHandler);
        };

        script.type = 'text/javascript';
        script.src = environment.libraryUrl;
        script.addEventListener('load', onLoadHandler);

        document.getElementsByTagName('head')[0].appendChild(script);
      }).pipe(shareReplay(1));
    }

    return this.script$;
  }
}
