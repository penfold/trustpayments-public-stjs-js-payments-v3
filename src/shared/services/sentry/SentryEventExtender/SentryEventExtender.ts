import { Event } from '@sentry/types';
import { Service } from 'typedi';
import { Observable, TimeoutError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CardinalError } from '../../../../application/core/services/st-codec/CardinalError';
import { PaymentError } from '../../../../application/core/services/payments/error/PaymentError';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { FrameCommunicationError } from '../../message-bus/errors/FrameCommunicationError';
import { MisconfigurationError } from '../errors/MisconfigurationError';
import { ErrorTag } from '../constants/ErrorTag';
import { RequestTimeoutError } from '../errors/RequestTimeoutError';
import { IStore } from '../../../../application/core/store/IStore';
import { CommonState } from '../../../../application/core/store/reducers/initial-config/InitialConfigReducer';

@Service()
export class SentryEventExtender {

  constructor(private store: IStore<CommonState>) {
  }

  extendEvent<T extends { event: Event, error: Error }>() {
    return (source: Observable<T>): Observable<T> => source.pipe(tap(value => this.extendData(value.event, value.error)) );
  }

  private extendData(event: Event, originalException: Error | string ): Event {

    const { initialConfig, sentryData } = this.store.getState();

    event.extra = {
      initialConfig,
      transactionReference: {
        requestId: sentryData?.currentRequestId  || null,
        responseId: sentryData?.currentResponseId || null,
      },
    }

    switch (true) {
      // case  originalException instanceof GatewayError :
      //   // return this.processGatewayError(event, originalException as GatewayError);  @todo  STJS-3014 Before we have the list of gateway errors (errorcodes) that the sentry should log we disable the logging of gateway errors completely.
      //
      //   return null;
      case originalException instanceof TimeoutError:
        event.tags.tag = ErrorTag.TIMEOUT;

        return event;
      case originalException instanceof MisconfigurationError:
        event.extra.originalError = (originalException as MisconfigurationError)?.previousError;
        event.tags.tag = ErrorTag.MISCONFIGURATION;

        return event;
      case originalException instanceof RequestTimeoutError :

        return this.processRequestTimeoutError(event, originalException as RequestTimeoutError);
      case originalException instanceof CardinalError :
        event.tags.tag = ErrorTag.CARDINAL;
        event.extra.response = (originalException as CardinalError).response;

        return event;
      case originalException instanceof PaymentError :

        return this.processPaymentError(event, originalException as PaymentError);
      case originalException instanceof FrameCommunicationError :

        return this.processFrameCommunicationError(event, originalException as FrameCommunicationError);
      default:

        return event;
    }

  }

  private processRequestTimeoutError(event: Event, requestTimeoutError: RequestTimeoutError) {
    event.tags.tag = ErrorTag.TIMEOUT;
    event.tags.timeout_type = requestTimeoutError?.timeoutDetails?.type;
    event.tags.timeout_url = requestTimeoutError?.timeoutDetails?.requestUrl;
    event.extra.originalError = requestTimeoutError?.timeoutDetails?.originalError;
    return event;
  }

  private processPaymentError(event: Event, paymentError: PaymentError) {
    event.tags.tag = paymentError.isInitError() ? ErrorTag.PAYMENT_INIT : ErrorTag.PAYMENT;
    event.extra.paymentMethodName = paymentError.paymentMethodName;
    event.extra.errorData = paymentError.errorData;

    return event;
  }

  private processFrameCommunicationError(event: Event, frameCommunicationError: FrameCommunicationError) {
    event.tags.tag = ErrorTag.INTERNAL;
    event.extra.sourceFrame = frameCommunicationError.sourceFrame;
    event.extra.targetFrame = frameCommunicationError.targetFrame;
    event.extra.event = frameCommunicationError.event;
    event.extra.originalError = frameCommunicationError.originalError;
    event.extra.documentFrames = DomMethods.getAllIframes().map(element => ({
      name: element.name,
      src: element.src,
    }));

    return event;
  }

  // private processGatewayError(event, originalException){ @todo STJS-3014 Before we have the list of gateway errors (errorcodes) that the sentry should log we disable the logging of gateway errors completely.
  //     event.tags.tag = ErrorTag.GATEWAY;
  //     event.extra.response = originalException.response;
  //
  //     if ((event?.extra?.config as IConfig).livestatus === 0) {
  //       return null;
  //     }
  //     if ((originalException.response as IResponseData).errorcode === ErrorCode.INSUFFICIENT_FUNDS) {
  //       return null;
  //     }
  //     if ((originalException.response as IResponseData).errorcode === ErrorCode.BYPASS) {
  //       event.extra.response = originalException.response;
  //       event.tags.tag = ErrorTag.MISCONFIGURATION;
  //     }
  //     if ((originalException.response as IResponseData).errorcode === ErrorCode.INVALID_FIELD) {
  //       const exceptionsArray = ['pan', 'expirationDate', 'securityCode'];
  //       if ((originalException.response as IResponseData).errordata.some(errorfield => exceptionsArray.includes(errorfield))) {
  //         return null;
  //       } else {
  //         event.extra.response = originalException.response;
  //         event.tags.tag = ErrorTag.MISCONFIGURATION;
  //       }
  //     }
  //
  //     if ((event.extra.response as IResponseData)?.maskedpan) {
  //       (event.extra.response as IResponseData).maskedpan = '***';
  //     }
  //
  // }

}

