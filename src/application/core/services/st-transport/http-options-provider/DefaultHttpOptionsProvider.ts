import { IHttpOptionsProvider } from './IHttpOptionsProvider';
import { IHttpClientConfig } from '@trustpayments/http-client';
import { Service } from 'typedi';
import { IRequestObject } from '../../../models/IRequestObject';

@Service()
export class DefaultHttpOptionsProvider implements IHttpOptionsProvider {
  public static readonly REQUEST_TIMEOUT = 60 * 1000; // 60000
  public static readonly CONTENT_TYPE = 'application/json';

  getOptions(requestObject: IRequestObject): IHttpClientConfig {
    return {
      headers: {
        Accept: DefaultHttpOptionsProvider.CONTENT_TYPE,
        'Content-Type': DefaultHttpOptionsProvider.CONTENT_TYPE,
      },
      timeout: DefaultHttpOptionsProvider.REQUEST_TIMEOUT,
    };
  }
}