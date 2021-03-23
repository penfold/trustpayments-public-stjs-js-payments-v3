import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { instance, mock, when } from 'ts-mockito';
import { ResponseDecoderService } from './ResponseDecoderService';
import { IHttpClientResponse } from '@trustpayments/http-client/lib/httpclient';
import { InvalidResponseError } from './InvalidResponseError';
import { IJwtResponse } from './interfaces/IJwtResponse';
import { COMMUNICATION_ERROR_INVALID_RESPONSE } from '../../models/constants/Translations';

describe('ResponseDecoderService', () => {
  let jwtDecoder: JwtDecoder;
  let responseDecoderService: ResponseDecoderService;

  const prepareResponse: (data: any) => IHttpClientResponse<IJwtResponse> = (data: any) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  });

  beforeEach(() => {
    jwtDecoder = mock(JwtDecoder);
    responseDecoderService = new ResponseDecoderService(instance(jwtDecoder));
  });

  describe('decode()', () => {
    it('throws InvalidResponseError if response doesnt contain jwt', () => {
      expect(() => responseDecoderService.decode(prepareResponse(null))).toThrow(new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE));
      expect(() => responseDecoderService.decode(prepareResponse(''))).toThrow(new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE));
      expect(() => responseDecoderService.decode(prepareResponse({}))).toThrow(new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE));
    });

    it('throws InvalidResponseError if response jwt cannot be decoded', () => {
      when(jwtDecoder.decode('invalidjwt')).thenThrow(new Error('invalid jwt'));
      expect(() => responseDecoderService.decode(prepareResponse({ jwt: 'invalidjwt' }))).toThrow(new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE));
    });

    it('throws InvalidResponseError if response payload is missing', () => {
      when(jwtDecoder.decode('somejwt')).thenReturn({
        iat: 1616074548,
        payload: undefined,
        aud: 'foo',
        sitereference: 'bar',
      });

      expect(() => responseDecoderService.decode(prepareResponse({ jwt: 'somejwt' }))).toThrow(new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE));
    });

    it('throws InvalidResponseError if response payload has invalid version property', () => {
      when(jwtDecoder.decode('somejwt')).thenReturn({
        iat: 1616074548,
        payload: {
          requestreference: '123456',
          version: 'invalid-version',
          response: [{ foo: 'bar' }],
          secrand: 'foobar'
        },
        aud: 'foo',
        sitereference: 'bar',
      });

      expect(() => responseDecoderService.decode(prepareResponse({ jwt: 'somejwt' }))).toThrow(new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE));
    });

    it('throws InvalidResponseError if response payload doesnt have response property', () => {
      when(jwtDecoder.decode('somejwt')).thenReturn({
        iat: 1616074548,
        payload: {
          requestreference: '123456',
          version: '1.00',
          secrand: 'foobar'
        },
        aud: 'foo',
        sitereference: 'bar',
      });

      expect(() => responseDecoderService.decode(prepareResponse({ jwt: 'somejwt' }))).toThrow(new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE));
    });

    it('throws InvalidResponseError if response payload has empty response property', () => {
      when(jwtDecoder.decode('somejwt')).thenReturn({
        iat: 1616074548,
        payload: {
          requestreference: '123456',
          version: '1.00',
          response: [],
          secrand: 'foobar'
        },
        aud: 'foo',
        sitereference: 'bar',
      });

      expect(() => responseDecoderService.decode(prepareResponse({ jwt: 'somejwt' }))).toThrow(new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE));
    });

    it('parses the response jwt and returns the response object that contains customeroutput property', () => {
      when(jwtDecoder.decode('somejwt')).thenReturn({
        iat: 1616074548,
        payload: {
          requestreference: '123456',
          version: '1.00',
          response: [
            {
              aaa: 'aaa',
              bbb: 'bbb',
            },
            {
              ccc: 'ccc',
              ddd: 'ddd',
              customeroutput: 'SUCCESS',
            },
            {
              eee: 'eee',
              fff: 'fff',
            },
          ],
          secrand: 'foobar'
        },
        aud: 'foo',
        sitereference: 'bar',
      });

      const result = responseDecoderService.decode(prepareResponse({ jwt: 'somejwt' }));

      expect(result).toEqual({
        ccc: 'ccc',
        ddd: 'ddd',
        customeroutput: 'SUCCESS',
        jwt: 'somejwt',
      });
    });

    it('parses the response jwt and returns the last response object if customeroutput property is missing', () => {
      when(jwtDecoder.decode('somejwt')).thenReturn({
        iat: 1616074548,
        payload: {
          requestreference: '123456',
          version: '1.00',
          response: [
            {
              aaa: 'aaa',
              bbb: 'bbb',
            },
            {
              ccc: 'ccc',
              ddd: 'ddd',
            },
            {
              eee: 'eee',
              fff: 'fff',
            },
          ],
          secrand: 'foobar'
        },
        aud: 'foo',
        sitereference: 'bar',
      });

      const result = responseDecoderService.decode(prepareResponse({ jwt: 'somejwt' }));

      expect(result).toEqual({
        eee: 'eee',
        fff: 'fff',
        jwt: 'somejwt',
      });
    });
  });
});
