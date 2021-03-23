import { Service } from 'typedi';
import { Event, EventHint } from '@sentry/types';
import { GatewayError } from '../../../application/core/services/st-codec/GatewayError';

@Service()
export class EventScrubber {
  scrub(event: Event, hint?: EventHint): Event | null {
    const { originalException } = hint || {};

    if (originalException instanceof GatewayError) {
      return null;
    }

    if (event.extra && typeof event.extra.config === 'object') {
      event.extra.config = { ...event.extra.config, jwt: '*****' };
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
