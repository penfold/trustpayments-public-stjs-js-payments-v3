import { Service } from 'typedi';
import { Event, EventHint } from '@sentry/types';
import { TimeoutError } from 'rxjs';
import { GatewayError } from '../../../application/core/services/st-codec/GatewayError';
import { IConfig } from '../../model/config/IConfig';
import { IResponseData } from '../../../application/core/models/IResponseData';
import { CardinalError } from '../../../application/core/services/st-codec/CardinalError';
import { PaymentError } from '../../../application/core/services/payments/error/PaymentError';
import { FrameCommunicationError } from '../message-bus/errors/FrameCommunicationError';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { CommonState } from '../../../application/core/store/reducers/initial-config/InitialConfigReducer';
import { IStore } from '../../../application/core/store/IStore';
import { JwtMasker } from './JwtMasker';
import { RequestTimeoutError } from './RequestTimeoutError';
import { ErrorTag } from './ErrorTag';
import { MisconfigurationError } from './MisconfigurationError';
import { ErrorCode } from './ErrorCodes';

@Service()
export class EventScrubber {
  constructor(
    private jwtMasker: JwtMasker,
    private store: IStore<CommonState>,
  ) {
  }

  scrub(event: Event, hint?: EventHint): Event | null {
    const { originalException } = hint || {};

    event.extra.initialConfig = this.store.getState().initialConfig;

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

    if (originalException instanceof TimeoutError) {
      event.tags.tag = ErrorTag.TIMEOUT;
    }

    if (originalException instanceof RequestTimeoutError) {
      event.tags.tag = ErrorTag.TIMEOUT;
      event.tags.timeout_type = (hint?.originalException as RequestTimeoutError)?.timeoutDetails?.type;
      event.tags.timeout_url = (hint?.originalException as RequestTimeoutError)?.timeoutDetails?.requestUrl;
      event.extra.originalError = originalException.timeoutDetails?.originalError;
    }

    if (originalException instanceof CardinalError) {
      event.tags.tag = ErrorTag.CARDINAL;
      event.extra.response = originalException.response;
    }

    if (originalException instanceof MisconfigurationError) {
      event.tags.tag = ErrorTag.MISCONFIGURATION;
      event.extra.originalError = originalException.previousError;
    }

    if (originalException instanceof PaymentError) {
      event.tags.tag = originalException.isInitError() ? ErrorTag.PAYMENT_INIT : ErrorTag.PAYMENT;
      event.extra.paymentMethodName = originalException.paymentMethodName;
      event.extra.errorData = originalException.errorData;
    }

    if (originalException instanceof FrameCommunicationError) {
      event.tags.tag = ErrorTag.INTERNAL;
      event.extra.sourceFrame = originalException.sourceFrame;
      event.extra.targetFrame = originalException.targetFrame;
      event.extra.event = originalException.event;
      event.extra.originalError = originalException.originalError;
      event.extra.documentFrames = DomMethods.getAllIframes().map(element => ({
        name: element.name,
        src: element.src,
      }));
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
