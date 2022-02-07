import jwt_decode from 'jwt-decode';
import { Container } from 'typedi';
import { FormState } from '../../models/constants/FormState';
import { IErrorData } from '../../models/IErrorData';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IResponseData } from '../../models/IResponseData';
import { IStRequest } from '../../models/IStRequest';
import {
  COMMUNICATION_ERROR_INVALID_RESPONSE,
  COMMUNICATION_ERROR_INVALID_REQUEST,
} from '../../models/constants/Translations';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { Validation } from '../../shared/validation/Validation';
// @ts-ignore
import packageInfo from '../../../../../package.json';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { IStJwtObj } from '../../models/IStJwtObj';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { MessageBusToken, TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { Locale } from '../../shared/translator/Locale';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { IStJwtPayload } from '../../models/IStJwtPayload';
import { EventScope } from '../../models/constants/EventScope';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { IRequestObject } from '../../models/IRequestObject';
import { RequestType } from '../../../../shared/types/RequestType';
import { GatewayError } from './GatewayError';
import { InvalidResponseError } from './InvalidResponseError';
import { IResponsePayload } from './interfaces/IResponsePayload';
import { IRequestTypeResponse } from './interfaces/IRequestTypeResponse';

export class StCodec {
  static CONTENT_TYPE = 'application/json';
  static VERSION = '1.00';
  static VERSION_INFO = `STJS::N/A::${packageInfo.version}::N/A`;
  static MINIMUM_REQUEST_FIELDS = 1;
  static jwt: string;
  static originalJwt: string;

  /**
   * Generate a unique ID for a request
   * (this is informational. it doesn't need to be cryptographically random since one of those is allocated server-side)
   * @param length The total length of the Request ID
   *   (since we prepend 'J-' the random section will be 2 char shorter)
   * @return A newly generated random request ID
   */
  static createRequestId(length = 10): string {
    return 'J-' + Math.random().toString(36).substring(2, length);
  }

  static getErrorData(data: IResponseData): unknown {
    const { errordata, errormessage, requesttypedescription } = data;
    return {
      errordata,
      errormessage,
      requesttypedescription,
    };
  }

  static verifyResponseObject(responseData: IResponsePayload, jwtResponse: string): IResponseData {
    if (StCodec.isInvalidResponse(responseData)) {
      throw StCodec.handleInvalidResponse();
    }
    const responseContent: IResponseData = StCodec.determineResponse(responseData, jwtResponse);
    StCodec.handleValidGatewayResponse(responseContent, jwtResponse);
    return responseContent;
  }

  /** Publishes translated response as a TRANSACTION_COMPLETE event
   * to allow the page to submit to the merchant server
   * @param responseData The decoded response from the gateway
   * @param jwtResponse The raw JWT response from the gateway
   */
  static publishResponse(responseData: IResponseData, jwtResponse?: string): void {
    const translator = Container.get(TranslatorToken);
    responseData.errormessage = translator.translate(responseData.errormessage);
    const eventData = { ...responseData };
    if (jwtResponse !== undefined) {
      eventData.jwt = jwtResponse;
    }
    if (responseData.threedresponse !== undefined) {
      eventData.threedresponse = responseData.threedresponse;
    }
    if (responseData.pares !== undefined) {
      eventData.pares = responseData.pares;
      eventData.md = responseData.md;
    }
    const notificationEvent: IMessageBusEvent = {
      data: eventData,
      type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE,
    };
    StCodec.getMessageBus().publish(notificationEvent, EventScope.ALL_FRAMES);
  }

  static updateJwt(newJWT: string): void {
    StCodec.jwt = newJWT ? newJWT : StCodec.jwt;
    StCodec.originalJwt = newJWT ? newJWT : StCodec.originalJwt;
    this.getMessageBus().publish({ type: PUBLIC_EVENTS.JWT_UPDATED, data: newJWT });
  }

  static resetJwt(): void {
    StCodec.jwt = StCodec.originalJwt;
    this.getMessageBus().publish({ type: PUBLIC_EVENTS.JWT_RESET });
  }

  static replaceJwt(jwt: string): void {
    StCodec.jwt = jwt;
    this.getMessageBus().publish({ type: PUBLIC_EVENTS.JWT_REPLACED, data: jwt });
  }

  private static notification: NotificationService;
  private static messageBus: IMessageBus;
  private static locale: Locale;
  private static REQUESTS_WITH_ERROR_MESSAGES = [
    'AUTH',
    'CACHETOKENISE',
    'ERROR',
    'THREEDQUERY',
    'WALLETVERIFY',
    'RISKDEC',
    'SUBSCRIPTION',
    'ACCOUNTCHECK',
  ];
  private static STATUS_CODES = { invalidfield: '30000', ok: '0', declined: '70000' };

  private static getMessageBus(): IMessageBus {
    return StCodec.messageBus || (StCodec.messageBus = Container.get(MessageBusToken));
  }

  private static getNotification(): NotificationService {
    return StCodec.notification || (StCodec.notification = Container.get(NotificationService));
  }

  private static createCommunicationError() {
    return {
      errorcode: '50003',
      errormessage: COMMUNICATION_ERROR_INVALID_RESPONSE,
    } as IResponseData;
  }

  private static handleInvalidResponse() {
    const validation = new Validation();
    StCodec.publishResponse(StCodec.createCommunicationError());
    StCodec.getNotification().error(COMMUNICATION_ERROR_INVALID_RESPONSE);
    validation.blockForm(FormState.AVAILABLE);
    StCodec.getMessageBus().publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, EventScope.ALL_FRAMES);

    return new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE);
  }

  private static isInvalidResponse(responseData: IResponsePayload) {
    return !(
      responseData &&
      responseData.version === StCodec.VERSION &&
      responseData.response &&
      (responseData.response as IRequestTypeResponse[]).length > 0
    );
  }

  private static determineResponse(responseData: IResponsePayload, jwtResponse: string) {
    let responseContent: IResponseData;
    responseData.response.forEach((r) => {
      if (r.customeroutput) {
        responseContent = r as IResponseData;
      }
    });
    if (!responseContent) {
      responseContent = responseData.response[responseData.response.length - 1] as IResponseData;
    }

    responseContent.jwt = jwtResponse;

    return responseContent;
  }

  private static propagateStatus(
    errormessageTranslated: string,
    responseContent: IResponseData,
    jwtResponse: string
  ): void {
    StCodec.getNotification().error(errormessageTranslated);
    StCodec.getMessageBus().publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, EventScope.ALL_FRAMES);
    StCodec.publishResponse(responseContent, jwtResponse);
  }

  private static handleValidGatewayResponse(responseContent: IResponseData, jwtResponse: string) {
    const translator = Container.get(TranslatorToken);
    const validation = new Validation();

    const { errorcode, errormessage, requesttypedescription } = responseContent;

    const errormessageTranslated = translator.translate(errormessage);

    if (!StCodec.REQUESTS_WITH_ERROR_MESSAGES.includes(requesttypedescription)) {
      return;
    }

    if (String(errorcode) === StCodec.STATUS_CODES.ok) {
      StCodec.publishResponse(responseContent, jwtResponse);
      return;
    }

    Container.get(SentryService).sendCustomMessage(
      new GatewayError(`Gateway error - ${errormessage}`, responseContent)
    );

    if (responseContent.walletsource && responseContent.walletsource === 'APPLEPAY') {
      StCodec.propagateStatus(errormessageTranslated, responseContent, jwtResponse);
      return new GatewayError(errormessage, responseContent);
    }

    if (responseContent.errordata) {
      validation.getErrorData(StCodec.getErrorData(responseContent) as IErrorData);
    }

    validation.blockForm(FormState.AVAILABLE);
    StCodec.propagateStatus(errormessageTranslated, responseContent, jwtResponse);
    throw new GatewayError(errormessage, responseContent);
  }

  private static decodeResponseJwt(jwt: string, reject: (error: Error) => void) {
    let decoded: IStJwtObj<IResponsePayload>;
    try {
      decoded = jwt_decode<IStJwtObj<IResponsePayload>>(jwt);
    } catch (e) {
      reject(StCodec.handleInvalidResponse());
    }
    return decoded;
  }

  private readonly requestId: string;
  private jwtDecoder: JwtDecoder;

  constructor(jwtDecoder: JwtDecoder, jwt: string) {
    this.requestId = StCodec.createRequestId();
    this.jwtDecoder = jwtDecoder;
    StCodec.notification = Container.get(NotificationService);
    StCodec.jwt = jwt;
    StCodec.originalJwt = jwt;
    StCodec.locale = this.jwtDecoder.decode<IStJwtPayload>(StCodec.jwt).payload.locale || 'en_GB';
  }

  buildRequestObject(requestData: IStRequest): Record<string, unknown> {
    return {
      acceptcustomeroutput: '2.00',
      jwt: StCodec.jwt,
      request: [
        {
          ...requestData,
          requestid: this.requestId,
          sitereference: this.jwtDecoder.decode(StCodec.jwt).sitereference,
        },
      ],
      version: StCodec.VERSION,
      versioninfo: StCodec.VERSION_INFO,
    };
  }

  encode(requestObject: IStRequest): string {
    if (!Object.keys(requestObject).length) {
      StCodec.getMessageBus().publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, EventScope.ALL_FRAMES);
      StCodec.getNotification().error(COMMUNICATION_ERROR_INVALID_REQUEST);
      throw new Error(COMMUNICATION_ERROR_INVALID_REQUEST);
    }
    return JSON.stringify(this.buildRequestObject(requestObject));
  }

  // requestBody is added as workaround for capturing failed JSINIT request
  async decode(responseObject: Response | Record<string, unknown>, requestBody?: IRequestObject): Promise<Record<string, unknown>> {
    let isCardPayment: boolean; // this is workaround for capturing failed card AUTH request

    return new Promise((resolve, reject) => {
      if (typeof responseObject.json === 'function') {
        responseObject.json().then((responseData: IResponsePayload) => {
          try {
            const decoded = StCodec.decodeResponseJwt(responseData.jwt, reject);
            isCardPayment = decoded?.payload?.response?.some(response => response?.requesttypedescription === RequestType.AUTH || response?.requesttypedescription === RequestType.THREEDQUERY);
            const verifiedResponse: IResponseData = StCodec.verifyResponseObject(decoded.payload, responseData.jwt);

            if (Number(verifiedResponse.errorcode) === 0) {
              StCodec.replaceJwt(decoded.payload.jwt);
            } else {
              Container.get(SentryService).sendCustomMessage(
                new GatewayError(`Gateway error - ${verifiedResponse.errormessage}`, verifiedResponse)
              );
              StCodec.resetJwt();
            }

            resolve({
              jwt: responseData.jwt,
              response: verifiedResponse,
            });
          } catch (error) {
            Container.get(SentryService).sendCustomMessage(
              new GatewayError(`Gateway error - ${error.message}`, error)
            );
            if (requestBody?.request.some(request => request.requesttypedescriptions?.includes(RequestType.JSINIT))) {
              const jsInitFailedEvent: IMessageBusEvent = {
                type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_FAILED,
                data: {
                  name: 'CARD',
                },
              };
              StCodec.getMessageBus().publish(jsInitFailedEvent, EventScope.EXPOSED);
            } else if (isCardPayment) {
              const cardPaymentFailedEvent: IMessageBusEvent = {
                type: PUBLIC_EVENTS.PAYMENT_METHOD_FAILED,
                data: {
                  name: 'CARD',
                },
              };
              StCodec.getMessageBus().publish(cardPaymentFailedEvent, EventScope.EXPOSED);
            }
            StCodec.resetJwt();
          }
        });
      } else {
        StCodec.resetJwt();
        reject(StCodec.handleInvalidResponse());
      }
    });
  }
}
