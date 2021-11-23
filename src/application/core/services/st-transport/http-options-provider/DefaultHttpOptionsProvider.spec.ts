import { instance, mock } from 'ts-mockito';
import { IHttpClientConfig } from '@trustpayments/http-client';
import { IRequestObject } from '../../../models/IRequestObject';
import { environment } from '../../../../../environments/environment';
import { DefaultHttpOptionsProvider } from './DefaultHttpOptionsProvider';

describe('DefaultHttpOptionsProvider', () => {
  let defaultHttpOptionsProvider: DefaultHttpOptionsProvider;

  beforeEach(() => {
    defaultHttpOptionsProvider = new DefaultHttpOptionsProvider();
  });

  describe('getOptions()', () => {
    it('provides default http request options', () => {
      const request: IRequestObject = mock<IRequestObject>();
      const options: IHttpClientConfig = defaultHttpOptionsProvider.getOptions(instance(request));

      expect(options).toEqual({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: environment.REQUEST_TIMEOUT,
      });
    });
  });
});
