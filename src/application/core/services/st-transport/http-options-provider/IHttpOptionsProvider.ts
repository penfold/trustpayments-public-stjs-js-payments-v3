import { IHttpClientConfig } from '@trustpayments/http-client';
import { IRequestObject } from '../../../models/IRequestObject';

export abstract class IHttpOptionsProvider {
  abstract getOptions(requestObject: IRequestObject): IHttpClientConfig;
}
