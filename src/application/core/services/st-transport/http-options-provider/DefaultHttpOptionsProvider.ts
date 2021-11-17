import { IHttpClientConfig } from '@trustpayments/http-client';
import { Service } from 'typedi';
import { IRequestObject } from '../../../models/IRequestObject';
import { IHttpOptionsProvider } from './IHttpOptionsProvider';

@Service()
export class DefaultHttpOptionsProvider implements IHttpOptionsProvider {
  static readonly REQUEST_TIMEOUT = 60 * 1000; // 60000
  static readonly CONTENT_TYPE = 'application/json';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
