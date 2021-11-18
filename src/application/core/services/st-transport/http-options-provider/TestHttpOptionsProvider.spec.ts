import { instance, mock, when } from 'ts-mockito';
import { IHttpClientConfig } from '@trustpayments/http-client';
import { IRequestObject } from '../../../models/IRequestObject';
import { JwtDecoder } from '../../../../../shared/services/jwt-decoder/JwtDecoder';
import { TestHttpOptionsProvider } from './TestHttpOptionsProvider';

describe('TestHttpOptionsProvider', () => {
  let testHttpOptionsProvider: TestHttpOptionsProvider;
  let jwtDecoderMock: JwtDecoder;
  let request: IRequestObject;

  beforeEach(() => {
    jwtDecoderMock = mock(JwtDecoder);
    request = mock<IRequestObject>();
    testHttpOptionsProvider = new TestHttpOptionsProvider(instance(jwtDecoderMock));

    when(request.jwt).thenReturn('somejwt');
    when(request.request).thenReturn([{ requestid: '', sitereference: '' }]);
    when(jwtDecoderMock.decode('somejwt')).thenReturn({
      payload: {
        requesttypedescriptions: [],
      },
    });
  });

  describe('getOptions()', () => {
    it('provides default http request options', () => {
      const options: IHttpClientConfig = testHttpOptionsProvider.getOptions(instance(request));

      expect(options).toEqual({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'ST-Request-Types': '',
        },
        timeout: 60000,
      });
    });

    it('put request types from jwt payload into headers', () => {
      when(jwtDecoderMock.decode('somejwt')).thenReturn({
        payload: {
          requesttypedescriptions: ['RISKDEC', 'THREEDQUERY', 'AUTH'],
        },
      });

      const options: IHttpClientConfig = testHttpOptionsProvider.getOptions(instance(request));

      expect(options.headers['ST-Request-Types']).toEqual('RISKDEC, THREEDQUERY, AUTH');
    });

    it('put request types from request payload into headers if they exist instead of those from jwt', () => {
      when(jwtDecoderMock.decode('somejwt')).thenReturn({
        payload: {
          requesttypedescriptions: ['RISKDEC', 'THREEDQUERY', 'AUTH'],
        },
      });

      when(request.request).thenReturn([
        {
          requestid: '',
          sitereference: '',
          requesttypedescriptions: ['ACCOUNTCHECK', 'THREEDQUERY', 'AUTH'],
        },
      ]);

      const options: IHttpClientConfig = testHttpOptionsProvider.getOptions(instance(request));

      expect(options.headers['ST-Request-Types']).toEqual('ACCOUNTCHECK, THREEDQUERY, AUTH');
    });

    it('puts empty request type array if they are not provided in jwt nor request payload', () => {
      const options: IHttpClientConfig = testHttpOptionsProvider.getOptions(instance(request));

      expect(options.headers['ST-Request-Types']).toEqual('');
    });

    it('puts empty request type array if jwt paylaod cannot be decoded', () => {
      when(jwtDecoderMock.decode('somejwt')).thenThrow(new Error('decode failed'));

      const options: IHttpClientConfig = testHttpOptionsProvider.getOptions(instance(request));

      expect(options.headers['ST-Request-Types']).toEqual('');
    });
  });
});
