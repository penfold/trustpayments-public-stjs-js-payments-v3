import { Service } from 'typedi';
import { IHttpClientConfig } from '@trustpayments/http-client';
import { IRequestObject } from '../../../models/IRequestObject';

@Service()
export abstract class IHttpOptionsProvider {
  abstract getOptions(requestObject: IRequestObject): IHttpClientConfig;
}
