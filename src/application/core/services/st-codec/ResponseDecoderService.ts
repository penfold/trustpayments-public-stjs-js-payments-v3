import { Service } from 'typedi';
import { IHttpClientResponse } from '@trustpayments/http-client';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { COMMUNICATION_ERROR_INVALID_RESPONSE } from '../../models/constants/Translations';
import { InvalidResponseError } from './InvalidResponseError';
import { IJwtResponse } from './interfaces/IJwtResponse';
import { IResponsePayload } from './interfaces/IResponsePayload';
import { IRequestTypeResponse } from './interfaces/IRequestTypeResponse';
import { IDecodedResponse } from './interfaces/IDecodedResponse';

@Service()
export class ResponseDecoderService {
  private static readonly RESPONSE_VERSION = '1.00';

  constructor(private jwtDecoder: JwtDecoder) {}

  decode(response: IHttpClientResponse<IJwtResponse>): IDecodedResponse {
    try {
      const jwt: string = response.data.jwt;
      const { payload } = this.jwtDecoder.decode<IResponsePayload>(jwt);

      if (!this.isResponsePayloadValid(payload)) {
        throw new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE);
      }

      return {
        customerOutput: this.extractResponseObject(payload),
        requestreference: payload.requestreference,
        responseJwt: jwt,
        updatedMerchantJwt: payload.jwt,
      };
    } catch (e) {
      throw new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE);
    }
  }

  private isResponsePayloadValid(payload: IResponsePayload): boolean {
    return (
      payload &&
      payload.version === ResponseDecoderService.RESPONSE_VERSION &&
      payload.response &&
      payload.response.length > 0
    );
  }

  private extractResponseObject(payload: IResponsePayload): IRequestTypeResponse {
    let responseObject: IRequestTypeResponse;

    for (responseObject of payload.response) {
      if (responseObject.customeroutput) {
        break;
      }
    }

    return responseObject;
  }
}
