import { Service } from 'typedi';
import { Event } from '@sentry/types';

@Service()
export class EventScrubber {
  scrub(event: Event): Event {
    if (event.extra && typeof event.extra.config === 'object') {
      event.extra.config = { ...(event.extra.config as object), jwt: '*****' };
    }

    if (event.request && event.request.url) {
      event.request.url = this.maskJwt(event.request.url);
    }

    if (event.request && event.request.query_string) {
      event.request.query_string = this.maskJwt(event.request.query_string);
    }

    return event;
  }

  private maskJwt(queryString: string): string {
    return queryString.replace(/(^|\?|&)jwt=.*?(&|$)/, '$1jwt=*****$2');
  }
}
