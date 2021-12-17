import { Service } from 'typedi';
import { Event, EventHint } from '@sentry/types';
import { GatewayError } from '../../../application/core/services/st-codec/GatewayError';
import { IConfig } from '../../model/config/IConfig';
import { IResponseData } from '../../../application/core/models/IResponseData';
import { JwtMasker } from './JwtMasker';
import { RequestTimeoutError } from './RequestTimeoutError';
import { ErrorTag } from './ErrorTag';
import { MisconfigurationError } from './MisconfigurationError';
import { ErrorCode } from './ErrorCodes';

@Service()
export class EventScrubber {
  constructor(private jwtMasker: JwtMasker) {
  }

  scrub(event: Event, hint?: EventHint): Event | null {
    const { originalException } = hint || {};

    if (originalException instanceof GatewayError) {
      event.tags.tag = ErrorTag.GATEWAY;
      event.extra.response = originalException.response;

      if ((event?.extra?.config as IConfig).livestatus === 0) {
        return null;
      }
      if ((originalException.response as IResponseData).errorcode === ErrorCode.INSUFFICIENT_FUNDS) {
        return null;
      }
      if ((originalException.response as IResponseData).errorcode === ErrorCode.BYPASS) {
        event.extra.response = originalException.response;
        event.tags.tag = ErrorTag.MISCONFIGURATION;
      }
      if ((originalException.response as IResponseData).errorcode === ErrorCode.INVALID_FIELD) {
        const exceptionsArray = ['pan', 'expirationDate', 'securityCode'];
        if ((originalException.response as IResponseData).errordata.some(errorfield => exceptionsArray.includes(errorfield))) {
          return null;
        } else {
          event.extra.response = originalException.response;
          event.tags.tag = ErrorTag.MISCONFIGURATION;
        }
      }
    }
    
    if (originalException instanceof RequestTimeoutError) {
      event.tags.tag = ErrorTag.TIMEOUT;
      event.tags.timeout_type = (hint?.originalException as RequestTimeoutError)?.timeoutDetails?.type;
      event.tags.timeout_url = (hint?.originalException as RequestTimeoutError)?.timeoutDetails?.requestUrl;
    }

    if (originalException instanceof MisconfigurationError) {
      event.tags.tag = ErrorTag.MISCONFIGURATION;
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
