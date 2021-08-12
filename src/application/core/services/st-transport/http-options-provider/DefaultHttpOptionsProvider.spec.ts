import { DefaultHttpOptionsProvider } from './DefaultHttpOptionsProvider';
import { instance, mock } from 'ts-mockito';
import { IRequestObject } from '../../../models/IRequestObject';
import { IHttpClientConfig } from '@trustpayments/http-client';

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
        timeout: 60000,
      });
    });
  });
});
