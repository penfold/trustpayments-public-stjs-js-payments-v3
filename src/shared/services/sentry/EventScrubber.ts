import { Service } from 'typedi';
import { Event, EventHint } from '@sentry/types';
import { GatewayError } from '../../../application/core/services/st-codec/GatewayError';
import { JwtMasker } from './JwtMasker';
import { RequestTimeoutError } from './RequestTimeoutError';
import { ErrorTag } from './ErrorTag';

@Service()
export class EventScrubber {
  constructor(private jwtMasker: JwtMasker) {
  }

  scrub(event: Event, hint?: EventHint): Event | null {
    const { originalException } = hint || {};

    if (originalException instanceof GatewayError) {
      return null;
    }
    
    if (originalException instanceof RequestTimeoutError) {
      event.tags.tag = ErrorTag.TIMEOUT;
    }

    if (event.extra && typeof event.extra.config === 'object') {
      event.extra.config = { ...event.extra.config, jwt: '*****' };
    }

    if (event.request && event.request.url) {
      event.request.url = this.jwtMasker.mask(event.request.url);
    }

    if (event.request && event.request.query_string) {
      event.request.query_string = this.jwtMasker.mask(event.request.query_string);
    }

    return event;
  }
}
