import { Service } from 'typedi';
import { IHttpClientConfig } from '@trustpayments/http-client';
import { IRequestObject } from '../../../models/IRequestObject';
import { RequestType } from '../../../../../shared/types/RequestType';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { IStJwtPayload } from '../../../models/IStJwtPayload';
import { IHttpOptionsProvider } from './IHttpOptionsProvider';
import { DefaultHttpOptionsProvider } from './DefaultHttpOptionsProvider';

@Service()
export class TestHttpOptionsProvider implements IHttpOptionsProvider {
  constructor(private jwtDecoder: JwtDecoder) {}

  getOptions(requestObject: IRequestObject): IHttpClientConfig {
    return {
      headers: {
        Accept: DefaultHttpOptionsProvider.CONTENT_TYPE,
        'Content-Type': DefaultHttpOptionsProvider.CONTENT_TYPE,
        'ST-Request-Types': this.extractRequestTypesFromRequest(requestObject).join(', '),
      },
      timeout: DefaultHttpOptionsProvider.REQUEST_TIMEOUT,
    };
  }

  private extractRequestTypesFromRequest(requestObject: IRequestObject): RequestType[] {
    try {
      if (requestObject.request[0].requesttypedescriptions) {
        return requestObject.request[0].requesttypedescriptions as RequestType[];
      }

      return this.jwtDecoder.decode<IStJwtPayload>(requestObject.jwt).payload.requesttypedescriptions;
    } catch (e) {
      return [];
    }
  }
}
