import jwt_decode from 'jwt-decode';
import { FormState } from '../../models/constants/FormState';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IResponseData } from '../../models/IResponseData';
import { COMMUNICATION_ERROR_INVALID_RESPONSE } from '../../models/constants/Translations';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { Translator } from '../../shared/translator/Translator';
import { Validation } from '../../shared/validation/Validation';
import { Container, Service } from 'typedi';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { IStJwtObj } from '../../models/IStJwtObj';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { MessageBusToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { InvalidResponseError } from './InvalidResponseError';
import { Locale } from '../../shared/translator/Locale';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { GatewayError } from './GatewayError';
import { IErrorData } from '../../models/IErrorData';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';

Service();
export class RequestDecoder {
  public VERSION = '1.00';
  public jwt: string;
  public originalJwt: string;
  private locale: Locale;
  private REQUESTS_WITH_ERROR_MESSAGES = [
    'AUTH',
    'CACHETOKENISE',
    'ERROR',
    'THREEDQUERY',
    'WALLETVERIFY',
    'RISKDEC',
    'SUBSCRIPTION',
    'ACCOUNTCHECK'
  ];
  private STATUS_CODES = { invalidfield: '30000', ok: '0', declined: '70000' };

  constructor(
    private jwtDecoder: JwtDecoder,
    private messageBus: IMessageBus,
    private notification: NotificationService
  ) {
    this.notification = Container.get(NotificationService);
    this.jwt = 'jwt';
    this.originalJwt = 'jwt';
    this.locale = jwtDecoder.decode(this.jwt).payload.locale;
  }

  updateJwt(newJWT: string) {
    this.jwt = newJWT ? newJWT : this.jwt;
    this.originalJwt = newJWT ? newJWT : this.originalJwt;
    this.getMessageBus().publish({ type: PUBLIC_EVENTS.JWT_UPDATED, data: newJWT });
  }

  resetJwt(): void {
    this.jwt = this.originalJwt;
    this.getMessageBus().publish({ type: PUBLIC_EVENTS.JWT_RESET });
  }

  replaceJwt(jwt: string): void {
    this.jwt = jwt;
    this.getMessageBus().publish({ type: PUBLIC_EVENTS.JWT_REPLACED, data: jwt });
  }

  private getMessageBus(): IMessageBus {
    return this.messageBus || (this.messageBus = Container.get(MessageBusToken));
  }

  private getNotification(): NotificationService {
    return this.notification || (this.notification = Container.get(NotificationService));
  }

  public async decode(responseObject: Response | {}): Promise<object> {
    return new Promise((resolve, reject) => {
      if ('json' in responseObject) {
        responseObject.json().then(responseData => {
          try {
            const decoded: IStJwtObj = this.decodeResponseJwt(responseData.jwt, reject);
            const verifiedResponse: IResponseData = this.verifyResponseObject(decoded.payload, responseData.jwt);

            if (Number(verifiedResponse.errorcode) === 0) {
              this.replaceJwt(decoded.payload.jwt);
            } else {
              this.resetJwt();
            }

            resolve({
              jwt: responseData.jwt,
              response: verifiedResponse
            });
          } catch (error) {
            this.resetJwt();
          }
        });
      } else {
        this.resetJwt();
        reject(this.handleInvalidResponse());
      }
    });
  }

  private decodeResponseJwt(jwt: string, reject: (error: Error) => void) {
    let decoded: any;
    try {
      decoded = jwt_decode(jwt) as any;
    } catch (e) {
      reject(this.handleInvalidResponse());
    }
    return decoded;
  }

  private handleInvalidResponse() {
    const validation = new Validation();
    this.publishResponse(this.createCommunicationError());
    this.getNotification().error(COMMUNICATION_ERROR_INVALID_RESPONSE);
    validation.blockForm(FormState.AVAILABLE);
    this.getMessageBus().publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);

    return new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE);
  }

  private createCommunicationError() {
    return {
      errorcode: '50003',
      errormessage: COMMUNICATION_ERROR_INVALID_RESPONSE
    } as IResponseData;
  }

  publishResponse(responseData: IResponseData, jwtResponse?: string, threedresponse?: string) {
    const translator = new Translator(this.locale);
    responseData.errormessage = translator.translate(responseData.errormessage);
    const eventData = { ...responseData };
    if (jwtResponse !== undefined) {
      eventData.jwt = jwtResponse;
    }
    if (threedresponse !== undefined) {
      eventData.threedresponse = threedresponse;
    }
    const notificationEvent: IMessageBusEvent = {
      data: eventData,
      type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE
    };
    this.getMessageBus().publish(notificationEvent, true);
  }

  verifyResponseObject(responseData: any, jwtResponse: string): IResponseData {
    if (this.isInvalidResponse(responseData)) {
      throw this.handleInvalidResponse();
    }
    const responseContent: IResponseData = this.determineResponse(responseData, jwtResponse);
    this.handleValidGatewayResponse(responseContent, jwtResponse);
    return responseContent;
  }

  private isInvalidResponse(responseData: any) {
    return !(
      responseData &&
      responseData.version === this.VERSION &&
      responseData.response &&
      responseData.response.length > 0
    );
  }

  private determineResponse(responseData: any, jwtResponse: string) {
    let responseContent: IResponseData;
    responseData.response.forEach((r: any) => {
      if (r.customeroutput) {
        responseContent = r;
      }
    });
    if (!responseContent) {
      responseContent = responseData.response[responseData.response.length - 1];
    }

    responseContent.jwt = jwtResponse;

    return responseContent;
  }

  private handleValidGatewayResponse(responseContent: IResponseData, jwtResponse: string) {
    const translator = new Translator(this.locale);
    const validation = new Validation();

    const { errorcode, errormessage, requesttypedescription } = responseContent;

    const errormessageTranslated = translator.translate(errormessage);

    if (!this.REQUESTS_WITH_ERROR_MESSAGES.includes(requesttypedescription)) {
      return;
    }

    if (errorcode === this.STATUS_CODES.ok) {
      this.publishResponse(responseContent, jwtResponse);
      return;
    }

    if (responseContent.walletsource && responseContent.walletsource === 'APPLEPAY') {
      this.propagateStatus(errormessageTranslated, responseContent, jwtResponse);
      return new GatewayError(errormessage);
    }

    if (responseContent.errordata) {
      validation.getErrorData(this.getCurrentErrorData(responseContent));
    }

    validation.blockForm(FormState.AVAILABLE);
    this.propagateStatus(errormessageTranslated, responseContent, jwtResponse);
    throw new GatewayError(errormessage);
  }

  private propagateStatus(errormessageTranslated: string, responseContent: IResponseData, jwtResponse: string): void {
    this.getNotification().error(errormessageTranslated);
    this.getMessageBus().publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
    this.publishResponse(responseContent, jwtResponse);
  }

  getErrorData(errorData: IErrorData) {
    const { errordata, errormessage } = this.getCurrentErrorData(errorData);
    const validationEvent: IMessageBusEvent = {
      data: { field: errordata[0], message: errormessage },
      type: Validation.CLEAR_VALUE
    };

    this.broadcastFormFieldError(errordata[0], validationEvent);

    if (errordata.find((element: string) => element.includes(Validation.MERCHANT_EXTRA_FIELDS_PREFIX))) {
      validationEvent.type = MessageBus.EVENTS.VALIDATE_MERCHANT_FIELD;
      this.messageBus.publish(validationEvent);
    }

    return { field: errordata[0], errormessage };
  }

  getCurrentErrorData(data: any) {
    const { errordata, errormessage, requesttypedescription } = data;
    return {
      errordata,
      errormessage,
      requesttypedescription
    };
  }

  private broadcastFormFieldError(errordata: string, event: IMessageBusEvent) {
    this.messageBus.publish(Validation.setValidateEvent(errordata, event));
  }
}
