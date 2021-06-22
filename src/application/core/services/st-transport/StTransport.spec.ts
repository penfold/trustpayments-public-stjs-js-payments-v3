import each from 'jest-each';
import { GlobalWithFetchMock } from 'jest-fetch-mock';
import { StTransport } from './StTransport';
import { Utils } from '../../shared/utils/Utils';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { mock, instance as mockInstance, when } from 'ts-mockito';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { StCodec } from '../st-codec/StCodec';
import { environment } from '../../../../environments/environment';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';

const customGlobal: GlobalWithFetchMock = (global as unknown) as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;

jest.mock('./../../shared/notification/Notification');

describe('StTransport class', () => {
  const config = {
    datacenterurl: 'https://example.com',
    jwt:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqd3RfdXNlciIsImlhdCI6MTYwNTcwNjc0NS42MjE4Mzc5LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfanNsaWJyYXJ5NzY0MjUiLCJyZXF1ZXN0dHlwZWRlc2NyaXB0aW9ucyI6WyJBQ0NPVU5UQ0hFQ0siLCJUSFJFRURRVUVSWSIsIkFVVEgiXX19.jYmZX4eU_BHVklpjpnjD5usB6hTHnCC9jFfrlSEfbWA',
  } as IConfig;
  const fetchRetryObject = {
    url: 'https://example.com',
    options: {},
    connectTimeout: 20000,
    delay: 2000,
    retries: 3,
    retryTimeout: 20000,
  };
  const timeoutError: Error | null = null;
  const resolvingPromise = (result: Record<string, unknown>) => {
    return new Promise(resolve => resolve(result));
  };
  const rejectingPromise = (reason: Error) => {
    return new Promise((_, reject) => reject(reason));
  };

  let instance: StTransport;
  const configProviderMock = mock<ConfigProvider>();
  const jwtDecoderMock: JwtDecoder = mock(JwtDecoder);
  let mockFT: jest.Mock;
  let codec: StCodec;

  beforeEach(() => {
    when(configProviderMock.getConfig()).thenReturn(config);
    instance = new StTransport(mockInstance(configProviderMock), mockInstance(jwtDecoderMock));
    // This effectively creates a MVP codec so that we aren't testing all that here
    // @ts-ignore
    instance._codec = codec = {
      encode: jest.fn(x => JSON.stringify(x)),
      decode: jest.fn(
        x =>
          new Promise((resolve, reject) => {
            if (typeof x.json === 'function') {
              resolve(x.json());
              return;
            }
            reject(new Error('codec error'));
          })
      ),
    } as StCodec;
  });

  afterEach(() => {
    environment.testEnvironment = false;
  });

  describe('Header options', () => {
    it('should return ST-Request-Types header when test env is set on true', () => {
      environment.testEnvironment = true;
      const requestBody = `{"jwt":"${config.jwt}"}`;
      // @ts-ignore
      const options = instance._getDefaultFetchOptions(requestBody);
      expect(options.headers).toHaveProperty('ST-Request-Types', 'ACCOUNTCHECK, THREEDQUERY, AUTH');
    });

    it('should not return ST-Request-Types header when test env is set on false', () => {
      const requestBody = `{"jwt":"${config.jwt}"}`;
      // @ts-ignore
      const options = instance._getDefaultFetchOptions(requestBody);
      expect(options.headers).not.toHaveProperty('ST-Request-Types');
    });

    each(['JSINIT', 'WALLETVERIFY']).it(
      `should return ST-Request-Type header when test env is set on true and requesttypedescriptions contains specific value`,
      req => {
        environment.testEnvironment = true;
        const requestBody = `{"jwt":"${config.jwt}"}`;
        const requestObject = { requesttypedescriptions: [req] };
        // @ts-ignore
        const options = instance._getDefaultFetchOptions(requestBody, requestObject.requesttypedescriptions);
        expect(options.headers).toHaveProperty('ST-Request-Types', req);
      }
    );
  });

  describe('Method sendRequest', () => {
    beforeEach(() => {
      // @ts-ignore
      instance._fetchRetry = jest.fn();
      // @ts-ignore
      mockFT = instance._fetchRetry as jest.Mock;
    });

    it('should build the fetch options', async () => {
      const requestBody = `{"jwt":"${config.jwt}"}`;
      const requestObject = { requesttypedescriptions: ['AUTH'] };

      mockFT.mockReturnValue(
        resolvingPromise({
          json: () =>
            resolvingPromise({
              errorcode: 0,
            }),
        })
      );
      await instance.sendRequest(requestObject);
      // @ts-ignore
      expect(instance._fetchRetry).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._fetchRetry).toHaveBeenCalledWith(config.datacenterurl, {
        // @ts-ignore
        ...instance._getDefaultFetchOptions(requestBody, requestObject.requesttypedescriptions),
        body: JSON.stringify(requestObject),
      });
    });

    it('should build the fetch options with merchantUrl is set', async () => {
      const requestBody = `{"jwt":"${config.jwt}"}`;
      const requestObject = { requesttypedescriptions: ['AUTH'] };

      mockFT.mockReturnValue(
        resolvingPromise({
          json: () =>
            resolvingPromise({
              errorcode: 0,
            }),
        })
      );
      await instance.sendRequest(requestObject, 'https://somemerchanturl.com');
      // @ts-ignore
      expect(instance._fetchRetry).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(instance._fetchRetry).toHaveBeenCalledWith('https://somemerchanturl.com', {
        // @ts-ignore
        ...instance._getDefaultFetchOptions(requestBody, requestObject.requesttypedescriptions),
        body: JSON.stringify(requestObject),
      });
    });

    each([
      [resolvingPromise({}), resolvingPromise({})],
      [rejectingPromise(timeoutError), resolvingPromise({})],
    ]).it('should reject invalid responses', async (mockFetch, expected) => {
      mockFT.mockReturnValue(mockFetch);

      async function testSendRequest() {
        return await instance.sendRequest({ requesttypedescription: 'AUTH' });
      }

      const response = testSendRequest();
      expect(response).toMatchObject(expected);
    });

    each([
      [
        resolvingPromise({
          json: () =>
            resolvingPromise({
              response: [
                {
                  errorcode: 0,
                },
              ],
              version: '1.00',
            }),
        }),
        { response: [{ errorcode: 0 }], version: '1.00' },
      ],
    ]).it('should decode the json response', async (mockFetch, expected) => {
      mockFT.mockReturnValue(mockFetch);
      await expect(instance.sendRequest({ requesttypedescription: 'AUTH' })).resolves.toEqual(expected);
      expect(codec.decode).toHaveBeenCalledWith({
        json: expect.any(Function),
      });
    });

    it('should throttle requests', async () => {
      const requestObject = { requesttypedescription: 'AUTH' };

      mockFT.mockReturnValue(
        resolvingPromise({
          json: () => ({ errorcode: 0 }),
        })
      );

      await instance.sendRequest(requestObject);
      await instance.sendRequest(requestObject);
      await instance.sendRequest(requestObject);

      expect(mockFT).toHaveBeenCalledTimes(1);
    });
  });

  describe('_fetchRetry()', () => {
    const { options, url, connectTimeout, delay, retries, retryTimeout } = fetchRetryObject;

    beforeEach(() => {
      Utils.promiseWithTimeout = jest.fn();
    });

    it('should call Utils.retryPromise with provided parameters', () => {
      Utils.retryPromise = jest.fn();
      // @ts-ignore
      instance._fetchRetry(url, options, connectTimeout, delay, retries, retryTimeout);
      expect(Utils.retryPromise).toHaveBeenCalled();
    });

    it('should call Utils.retryPromise with default parameters', () => {
      Utils.retryPromise = jest.fn();
      // @ts-ignore
      instance._fetchRetry(url, options);
      expect(Utils.retryPromise).toHaveBeenCalled();
    });
  });
});
