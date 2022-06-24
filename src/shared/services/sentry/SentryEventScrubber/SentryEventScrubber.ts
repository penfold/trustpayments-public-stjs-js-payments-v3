import { Service } from 'typedi';
import { Event } from '@sentry/types';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtMasker } from '../JwtMasker/JwtMasker';

@Service()
export class SentryEventScrubber {
  constructor(
    private jwtMasker: JwtMasker,
  ) {
  }

  scrubEvent<T extends { event: Event, error: Error }>() {
    return (source: Observable<T>): Observable<T> => source.pipe(tap(value => this.scrub(value.event)) );
  }

  private scrub(event: Event): Event | null {
    if(!event) {
      return null;
    }

    if(typeof event?.extra?.config === 'object') {
      event.extra.config = this.jwtMasker.mask(event.extra.config as { [key: string]: string });
    }

    if(event?.request?.url) {
      event.request.url = this.jwtMasker.mask(event.request.url);
    }

    if(event?.request?.query_string) {
      event.request.query_string = this.jwtMasker.mask(event.request.query_string);
    }

    return event;
  }
}
