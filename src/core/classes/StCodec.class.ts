import { INotificationEvent } from '../models/NotificationEvent';
import Language from '../shared/Language';
import MessageBus from '../shared/MessageBus';
import Notification from '../shared/Notification';
import { StJwt } from '../shared/StJwt';
import { Translator } from '../shared/Translator';

interface IStRequest {
  requesttypedescription: string;
  expirydate?: string;
  pan?: string;
  securitycode?: string;
  termurl?: string; // TODO shouldn't be needed for CC request but this needs to wait for 153 release
}

/**
 * Encodes and Decodes a request for the ST gateway
 */
class StCodec {
  public static CONTENT_TYPE = 'application/json';
  public static VERSION = '1.00';
  public static SUPPORTED_REQUEST_TYPES = ['WALLETVERIFY', 'JSINIT', 'THREEDQUERY', 'CACHETOKENISE', 'AUTH'];
  public static MINIMUM_REQUEST_FIELDS = 1;

  /**
   * Generate a unique ID for a request
   * (this is informational. it doesn't need to be cryptographically random since one of those is allocated server-side)
   * @param length The total length of the Request ID
   *   (since we prepend 'J-' the random section will be 2 char shorter)
   * @return A newly generated random request ID
   */
  public static _createRequestId(length = 10) {
    return (
      'J-' +
      Math.random()
        .toString(36)
        .substring(2, length)
    );
  }

  private static _notification = new Notification();
  private readonly _requestId: string;
  private readonly _jwt: string;
  private _translator: Translator;
  private _messageBus: MessageBus;

  constructor(jwt: string) {
    this._requestId = StCodec._createRequestId();
    this._jwt = jwt;
    this._translator = new Translator(new StJwt(this._jwt).locale);
    this._messageBus = new MessageBus();
  }

  /**
   * Add the wrapper data to the request object
   * @param requestData The data to be contained in this request
   * @return A JS object ready to be encoded
   */
  public buildRequestObject(requestData: object): object {
    return {
      jwt: this._jwt,
      request: [
        {
          ...requestData,
          requestid: this._requestId,
          sitereference: new StJwt(this._jwt).sitereference
        }
      ],
      version: StCodec.VERSION
    };
  }

  /**
   * Encode the request to send to the gateway
   * includes simple validation so we don't send utterly invalid requests
   * @param requestObject The data to be contained in the request
   * @return A JSON string for the fetch request body
   */
  public encode(requestObject: IStRequest) {
    if (
      Object.keys(requestObject).length < StCodec.MINIMUM_REQUEST_FIELDS ||
      !StCodec.SUPPORTED_REQUEST_TYPES.includes(requestObject.requesttypedescription)
    ) {
      StCodec._notification.error(Language.translations.COMMUNICATION_ERROR_INVALID_REQUEST);
      throw new Error(Language.translations.COMMUNICATION_ERROR_INVALID_REQUEST);
    }
    return JSON.stringify(this.buildRequestObject(requestObject));
  }

  /**
   * Decode the Json body from the fetch response
   * @Param responseObject The response object from the fetch promise
   * @return A Promise that resolves the body content (or raise an error casing the fetch to be rejected)
   */
  public decode(responseObject: Response | {}): Promise<object> {
    return new Promise((resolve, reject) => {
      if ('json' in responseObject) {
        responseObject.json().then(responseData => {
          resolve(this.verifyResponseObject(responseData));
        });
      } else {
        // TODO refactor with verifyRepsonseObject
        this.publishResponse({
          errorcode: '50003',
          errormessage: Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE
        });
        StCodec._notification.error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
        reject(new Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE));
      }
    });
  }

  /**
   * Verify the response from the gateway
   * @param responseData The response from the gateway
   * @return The content of the response that can be used in the following processes
   */
  public verifyResponseObject(responseData: any): object {
    // Ought we keep hold of the requestreference (eg. log it to console)
    // So that we can link these requests up with the gateway?
    if (
      !(
        responseData &&
        responseData.version === StCodec.VERSION &&
        responseData.response &&
        responseData.response.length === 1
      )
    ) {
      this.publishResponse({
        errorcode: '50003',
        errormessage: Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE
      });
      StCodec._notification.error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
      throw new Error(Language.translations.COMMUNICATION_ERROR_INVALID_RESPONSE);
    }
    const responseContent = responseData.response[0];
    this.publishResponse(responseContent);
    if (responseContent.errorcode !== '0') {
      // Should this be a custom error type which can also take a field that is at fault
      // so that errordata can be sent up to highlight the field?
      StCodec._notification.error(responseContent.errormessage);
      throw new Error(responseContent.errormessage);
    }
    return responseContent;
  }

  private publishResponse(responseData: any) {
    responseData.errormessage = this._translator.translate(responseData.errormessage);
    const notificationEvent: IMessageBusEvent = {
      data: responseData,
      type: MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE
    };
    this._messageBus.publish(notificationEvent, true);
  }
}

export { StCodec, IStRequest };
