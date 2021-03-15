import { FormState } from '../../models/constants/FormState';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IResponseData } from '../../models/IResponseData';
import { COMMUNICATION_ERROR_INVALID_RESPONSE } from '../../models/constants/Translations';
import { MessageBus } from '../../shared/message-bus/MessageBus';
import { Validation } from '../../shared/validation/Validation';
import { Service } from 'typedi';
import { IStJwtObj } from '../../models/IStJwtObj';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { InvalidResponseError } from './InvalidResponseError';
import { GatewayError } from './GatewayError';
import { IErrorData } from '../../models/IErrorData';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';

Service();
export class RequestDecoder {
  public VERSION = '1.00';
  public jwt: string;
  public originalJwt: string;
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

  constructor(private jwtDecoder: JwtDecoder, private messageBus: IMessageBus) {
    this.jwt = 'jwt';
    this.originalJwt = 'jwt';
  }

  updateJwt(newJWT: string) {
    this.jwt = newJWT ?? this.jwt;
    this.originalJwt = newJWT ?? this.originalJwt;
  }

  resetJwt(): void {
    this.jwt = this.originalJwt;
  }

  replaceJwt(jwt: string): void {
    this.jwt = jwt;
  }

  async decode(responseObject: Response | {}): Promise<object> {
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
      decoded = this.jwtDecoder.decode(jwt).payload as any;
    } catch (e) {
      reject(this.handleInvalidResponse());
    }
    return decoded;
  }

  private handleInvalidResponse() {
    const validation = new Validation();
    validation.blockForm(FormState.AVAILABLE);

    return new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE);
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
    const validation = new Validation();
    const { errorcode, errormessage, requesttypedescription } = responseContent;

    if (!this.REQUESTS_WITH_ERROR_MESSAGES.includes(requesttypedescription)) {
      return;
    }

    if (errorcode === this.STATUS_CODES.ok) {
      console.log('publish');
      console.log(responseContent, jwtResponse);
      return;
    }

    if (responseContent.walletsource && responseContent.walletsource === 'APPLEPAY') {
      return new GatewayError(errormessage);
    }

    if (responseContent.errordata) {
      validation.getErrorData(this.getCurrentErrorData(responseContent));
    }

    validation.blockForm(FormState.AVAILABLE);
    throw new GatewayError(errormessage);
  }

  getErrorData(errorData: IErrorData) {
    const { errordata, errormessage } = this.getCurrentErrorData(errorData);
    const validationEvent: IMessageBusEvent = {
      data: { field: errordata[0], message: errormessage },
      type: Validation.CLEAR_VALUE
    };

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
}
