import { IHttpClientConfig } from '@trustpayments/http-client';
import { Service } from 'typedi';
import { IRequestObject } from '../../../models/IRequestObject';
import { environment } from '../../../../../environments/environment';
import { IHttpOptionsProvider } from './IHttpOptionsProvider';

@Service()
export class DefaultHttpOptionsProvider implements IHttpOptionsProvider {
  static readonly CONTENT_TYPE = 'application/json';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getOptions(requestObject: IRequestObject): IHttpClientConfig {
    return {
      headers: {
        Accept: DefaultHttpOptionsProvider.CONTENT_TYPE,
        'Content-Type': DefaultHttpOptionsProvider.CONTENT_TYPE,
      },
      timeout: environment.REQUEST_TIMEOUT,
    };
  }
}
