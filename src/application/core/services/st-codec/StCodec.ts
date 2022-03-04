import jwt_decode from 'jwt-decode';
import { ContainerInstance, Service } from 'typedi';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IResponseData } from '../../models/IResponseData';
import { IStRequest } from '../../models/IStRequest';
import {
  COMMUNICATION_ERROR_INVALID_RESPONSE,
  COMMUNICATION_ERROR_INVALID_REQUEST,
} from '../../models/constants/Translations';
import { MessageBus } from '../../shared/message-bus/MessageBus';
// @ts-ignore
import packageInfo from '../../../../../package.json';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { IStJwtObj } from '../../models/IStJwtObj';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { MessageBusToken, TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { EventScope } from '../../models/constants/EventScope';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { IRequestObject } from '../../models/IRequestObject';
import { RequestType } from '../../../../shared/types/RequestType';
import { ValidationFactory } from '../../shared/validation/ValidationFactory';
import { Validation } from '../../shared/validation/Validation';
import { FormState } from '../../models/constants/FormState';
import { IErrorData } from '../../models/IErrorData';
import { ITranslator } from '../../shared/translator/ITranslator';
import { GatewayError } from './GatewayError';
import { InvalidResponseError } from './InvalidResponseError';
import { IResponsePayload } from './interfaces/IResponsePayload';
import { IRequestTypeResponse } from './interfaces/IRequestTypeResponse';

@Service()
export class StCodec {
  CONTENT_TYPE = 'application/json';
  VERSION = '1.00';
  VERSION_INFO = `STJS::N/A::${packageInfo.version}::N/A`;
  MINIMUM_REQUEST_FIELDS = 1;
  private originalJwt: string;
  private validation: Validation;
  private messageBus: IMessageBus;
  jwt: string;
  private readonly requestId: string;
  private jwtDecoder: JwtDecoder;
  private translator: ITranslator;

  /**
   * Generate a unique ID for a request
   * (this is informational. it doesn't need to be cryptographically random since one of those is allocated server-side)
   * @param length The total length of the Request ID
   *   (since we prepend 'J-' the random section will be 2 char shorter)
   * @return A newly generated random request ID
   */
  createRequestId(length = 10): string {
    return 'J-' + Math.random().toString(36).substring(2, length);
  }

  private getErrorData(data: IResponseData): unknown {
    const { errordata, errormessage, requesttypedescription } = data;
    return {
      errordata,
      errormessage,
      requesttypedescription,
    };
  }

  private verifyResponseObject(responseData: IResponsePayload, jwtResponse: string): IResponseData {
    if (this.isInvalidResponse(responseData)) {
      throw this.handleInvalidResponse();
    }
    const responseContent: IResponseData = this.determineResponse(responseData, jwtResponse);
    this.handleValidGatewayResponse(responseContent, jwtResponse);
    return responseContent;
  }

  /** Publishes translated response as a TRANSACTION_COMPLETE event
   * to allow the page to submit to the merchant server
   * @param responseData The decoded response from the gateway
   * @param jwtResponse The raw JWT response from the gateway
   */
  publishResponse(responseData: IResponseData, jwtResponse?: string): void {
    responseData.errormessage = this.translator.translate(responseData.errormessage) || responseData.errormessage;
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
    this.messageBus.publish(notificationEvent, EventScope.ALL_FRAMES);
  }

  updateJwt(newJWT: string): void {
    this.jwt  = newJWT ? newJWT : this.jwt ;
    this.originalJwt = newJWT ? newJWT : this.originalJwt;
    this.messageBus.publish({ type: PUBLIC_EVENTS.JWT_UPDATED, data: newJWT });
  }

  resetJwt(): void {
    this.jwt = this.originalJwt;
    this.messageBus.publish({ type: PUBLIC_EVENTS.JWT_RESET });
  }

  private replaceJwt(jwt: string): void {
    this.jwt = jwt;
    this.messageBus.publish({ type: PUBLIC_EVENTS.JWT_REPLACED, data: jwt });
  }

  private REQUESTS_WITH_ERROR_MESSAGES = [
    'AUTH',
    'CACHETOKENISE',
    'ERROR',
    'THREEDQUERY',
    'WALLETVERIFY',
    'RISKDEC',
    'SUBSCRIPTION',
    'ACCOUNTCHECK',
  ];
  private STATUS_CODES = { invalidfield: '30000', ok: '0', declined: '70000' };

  private createCommunicationError() {
    return {
      errorcode: '50003',
      errormessage: COMMUNICATION_ERROR_INVALID_RESPONSE,
    } as IResponseData;
  }

  private handleInvalidResponse() {
    this.publishResponse(this.createCommunicationError());
    this.notificationService.error(COMMUNICATION_ERROR_INVALID_RESPONSE);
    this.validation.blockForm(FormState.AVAILABLE);
    this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, EventScope.ALL_FRAMES);

    return new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE);
  }

  isInvalidResponse(responseData: IResponsePayload) {
    return !(
      responseData &&
      responseData?.version === this.VERSION &&
      responseData?.response &&
      (responseData?.response as IRequestTypeResponse[]).length > 0
    );
  }

  private determineResponse(responseData: IResponsePayload, jwtResponse: string) {
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

  private propagateStatus(
    errormessageTranslated: string,
    responseContent: IResponseData,
    jwtResponse: string
  ): void {
    this.notificationService.error(errormessageTranslated);
    this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, EventScope.ALL_FRAMES);
    this.publishResponse(responseContent, jwtResponse);
  }

  private decodeResponseJwt(jwt: string, reject: (error: Error) => void) {
    let decoded: IStJwtObj<IResponsePayload>;
    try {
      decoded = jwt_decode<IStJwtObj<IResponsePayload>>(jwt);
    } catch (e) {
      reject(this.handleInvalidResponse());
    }
    return decoded;
  }

  constructor(jwtDecoder: JwtDecoder,
              jwt: string,
              validationFactory: ValidationFactory,
              private container: ContainerInstance,
              private notificationService: NotificationService,
              private sentryService: SentryService) {
    this.messageBus = this.container.get(MessageBusToken);
    this.translator = this.container.get(TranslatorToken);
    this.validation = validationFactory.create();
    this.requestId = this.createRequestId();
    this.jwtDecoder = jwtDecoder;

    this.jwt = jwt;
    this.originalJwt = jwt;

    this.publishResponse({ errorcode: '0',
      errormessage: 'Payment has been successfully processed' })
  }

  private handleValidGatewayResponse(responseContent: IResponseData, jwtResponse: string) {
    const translator = this.container.get(TranslatorToken);

    const { errorcode, errormessage, requesttypedescription } = responseContent;

    const errormessageTranslated = translator.translate(errormessage);

    if (!this.REQUESTS_WITH_ERROR_MESSAGES.includes(requesttypedescription)) {
      return;
    }

    if (String(errorcode) === this.STATUS_CODES.ok) {
      this.publishResponse(responseContent, jwtResponse);
      return;
    }

    this.sentryService.sendCustomMessage(
      new GatewayError(`Gateway error - ${errormessage}`, responseContent)
    );

    if (responseContent.walletsource && responseContent.walletsource === 'APPLEPAY') {
      this.propagateStatus(errormessageTranslated, responseContent, jwtResponse);
      return new GatewayError(errormessage, responseContent);
    }

    if (responseContent.errordata) {
      this.validation.getErrorData(this.getErrorData(responseContent) as IErrorData);
    }

    this.validation.blockForm(FormState.AVAILABLE);
    this.propagateStatus(errormessageTranslated, responseContent, jwtResponse);
    throw new GatewayError(errormessage, responseContent);
  }
  buildRequestObject(requestData: IStRequest): Record<string, unknown> {
    return {
      acceptcustomeroutput: '2.00',
      jwt: this.jwt ,
      request: [
        {
          ...requestData,
          requestid: this.requestId,
          sitereference: this.jwtDecoder.decode(this.jwt).sitereference,
        },
      ],
      version: this.VERSION,
      versioninfo: this.VERSION_INFO,
    };
  }

  encode(requestObject: IStRequest): string {
    if (!Object.keys(requestObject).length) {
      this.messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, EventScope.ALL_FRAMES);
      this.notificationService.error(COMMUNICATION_ERROR_INVALID_REQUEST);
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
            const decoded = this.decodeResponseJwt(responseData.jwt, reject);
            isCardPayment = decoded?.payload?.response?.some(response => response?.requesttypedescription === RequestType.AUTH || response?.requesttypedescription === RequestType.THREEDQUERY);
            const verifiedResponse: IResponseData = this.verifyResponseObject(decoded.payload, responseData.jwt);

            if (Number(verifiedResponse.errorcode) === 0) {
              this.replaceJwt(decoded.payload.jwt);
            } else {
              this.sentryService.sendCustomMessage(
                new GatewayError(`Gateway error - ${verifiedResponse.errormessage}`, verifiedResponse)
              );
              this.resetJwt();
            }

            resolve({
              jwt: responseData.jwt,
              requestreference: decoded.payload.requestreference,
              response: verifiedResponse,
            });
          } catch (error) {
            this.sentryService.sendCustomMessage(
              new GatewayError(`Gateway error - ${error.message}`, error)
            );
            if (requestBody?.request.some(request => request.requesttypedescriptions?.includes(RequestType.JSINIT))) {
              const jsInitFailedEvent: IMessageBusEvent = {
                type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_FAILED,
                data: {
                  name: 'CARD',
                },
              };
              this.messageBus.publish(jsInitFailedEvent, EventScope.EXPOSED);
            } else if (isCardPayment) {
              const cardPaymentFailedEvent: IMessageBusEvent = {
                type: PUBLIC_EVENTS.PAYMENT_METHOD_FAILED,
                data: {
                  name: 'CARD',
                },
              };
              this.messageBus.publish(cardPaymentFailedEvent, EventScope.EXPOSED);
            }
            this.resetJwt();
          }
        });
      } else {
        this.resetJwt();
        reject(this.handleInvalidResponse());
      }
    });
  }
}
