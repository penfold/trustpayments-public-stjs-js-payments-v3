import { Service } from 'typedi';
import { Event, EventHint } from '@sentry/types';
import { GatewayError } from '../../../application/core/services/st-codec/GatewayError';
import { JwtMasker } from './JwtMasker';

@Service()
export class EventScrubber {
  constructor(private jwtMasker: JwtMasker) {
  }

  scrub(event: Event, hint?: EventHint): Event | null {
    const { originalException } = hint || {};

    if (originalException instanceof GatewayError) {
      return null;
    }

    if (event.stacktrace) {
      const { frames } = event.stacktrace;
      const results = frames.find(frame => this.isLibError(frame.filename));
      
      if (!results) {
        return null;
      }
    } else {
      return null;
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

  private isLibError(name: string) {
    return (
      name === '/js/v3/st.js' ||
      name === '/js/v3/control-frame.html' ||
      name === '/js/v3/security-code.html' ||
      name === '/js/v3/card-number.html'
    );
  }
}
