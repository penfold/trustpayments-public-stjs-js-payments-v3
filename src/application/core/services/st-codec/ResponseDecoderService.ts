import { Service } from 'typedi';
import { IHttpClientResponse } from '@trustpayments/http-client/lib/httpclient';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { InvalidResponseError } from './InvalidResponseError';
import { IJwtResponse } from './interfaces/IJwtResponse';
import { COMMUNICATION_ERROR_INVALID_RESPONSE } from '../../models/constants/Translations';
import { IResponsePayload } from './interfaces/IResponsePayload';
import { IRequestTypeResponse } from './interfaces/IRequestTypeResponse';
import { IStJwtObj } from '../../models/IStJwtObj';

@Service()
export class ResponseDecoderService {
  private static readonly RESPONSE_VERSION = '1.00';

  constructor(private jwtDecoder: JwtDecoder) {}

  decode(response: IHttpClientResponse<IJwtResponse>): IRequestTypeResponse & IJwtResponse {
    try {
      const jwt: string = response.data.jwt;
      const { payload } = this.jwtDecoder.decode<IStJwtObj<IResponsePayload>>(jwt);

      if (!this.isResponsePayloadValid(payload)) {
        throw new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE);
      }

      return { ...this.extractResponseObject(payload), jwt };
    } catch (e) {
      throw new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE);
    }
  }

  private isResponsePayloadValid(payload: IResponsePayload): boolean {
    return payload &&
      payload.version === ResponseDecoderService.RESPONSE_VERSION &&
      payload.response &&
      payload.response.length > 0;
  }

  private extractResponseObject(payload: IResponsePayload): IRequestTypeResponse {
    let responseObject: IRequestTypeResponse;

    for (responseObject of payload.response) {
      if (Boolean(responseObject.customeroutput)) {
        break;
      }
    }

    return responseObject;
  }
}