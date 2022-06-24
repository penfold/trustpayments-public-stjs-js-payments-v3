import { instance, mock, when } from 'ts-mockito';
import { IHttpClientResponse } from '@trustpayments/http-client';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { COMMUNICATION_ERROR_INVALID_RESPONSE } from '../../models/constants/Translations';
import { ResponseDecoderService } from './ResponseDecoderService';
import { InvalidResponseError } from './InvalidResponseError';
import { IJwtResponse } from './interfaces/IJwtResponse';

describe('ResponseDecoderService', () => {
  let jwtDecoder: JwtDecoder;
  let responseDecoderService: ResponseDecoderService;

  const prepareResponse: <T extends IJwtResponse | null | string>(data: T) => IHttpClientResponse<T> = (data) => ({
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
      expect(() => responseDecoderService.decode(prepareResponse(null))).toThrow(
        new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE)
      );
      expect(() => responseDecoderService.decode(prepareResponse('' as unknown as IJwtResponse))).toThrow(
        new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE)
      );
      expect(() => responseDecoderService.decode(prepareResponse({} as unknown as IJwtResponse))).toThrow(
        new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE)
      );
    });

    it('throws InvalidResponseError if response jwt cannot be decoded', () => {
      when(jwtDecoder.decode('invalidjwt')).thenThrow(new Error('invalid jwt'));
      expect(() => responseDecoderService.decode(prepareResponse({ jwt: 'invalidjwt' }))).toThrow(
        new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE)
      );
    });

    it('throws InvalidResponseError if response payload is missing', () => {
      when(jwtDecoder.decode('somejwt')).thenReturn({
        iat: 1616074548,
        payload: undefined,
        aud: 'foo',
        sitereference: 'bar',
      });

      expect(() => responseDecoderService.decode(prepareResponse({ jwt: 'somejwt' }))).toThrow(
        new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE)
      );
    });

    it('throws InvalidResponseError if response payload has invalid version property', () => {
      when(jwtDecoder.decode('somejwt')).thenReturn({
        iat: 1616074548,
        payload: {
          requestreference: '123456',
          version: 'invalid-version',
          response: [{ foo: 'bar' }],
          secrand: 'foobar',
        },
        aud: 'foo',
        sitereference: 'bar',
      });

      expect(() => responseDecoderService.decode(prepareResponse({ jwt: 'somejwt' }))).toThrow(
        new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE)
      );
    });

    it('throws InvalidResponseError if response payload doesnt have response property', () => {
      when(jwtDecoder.decode('somejwt')).thenReturn({
        iat: 1616074548,
        payload: {
          requestreference: '123456',
          version: '1.00',
          secrand: 'foobar',
        },
        aud: 'foo',
        sitereference: 'bar',
      });

      expect(() => responseDecoderService.decode(prepareResponse({ jwt: 'somejwt' }))).toThrow(
        new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE)
      );
    });

    it('throws InvalidResponseError if response payload has empty response property', () => {
      when(jwtDecoder.decode('somejwt')).thenReturn({
        iat: 1616074548,
        payload: {
          requestreference: '123456',
          version: '1.00',
          response: [],
          secrand: 'foobar',
        },
        aud: 'foo',
        sitereference: 'bar',
      });

      expect(() => responseDecoderService.decode(prepareResponse({ jwt: 'somejwt' }))).toThrow(
        new InvalidResponseError(COMMUNICATION_ERROR_INVALID_RESPONSE)
      );
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
          secrand: 'foobar',
        },
        aud: 'foo',
        sitereference: 'bar',
      });

      const result = responseDecoderService.decode(prepareResponse({ jwt: 'somejwt' }));

      expect(result).toEqual({
        responseJwt: 'somejwt',
        requestreference: '123456',
        customerOutput: {
          ccc: 'ccc',
          ddd: 'ddd',
          customeroutput: 'SUCCESS',
        },
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
          secrand: 'foobar',
        },
        aud: 'foo',
        sitereference: 'bar',
      });

      const result = responseDecoderService.decode(prepareResponse({ jwt: 'somejwt' }));

      expect(result).toEqual({
        responseJwt: 'somejwt',
        requestreference: '123456',
        customerOutput: {
          eee: 'eee',
          fff: 'fff',
        },
      });
    });

    it('returns updated merchant jwt if its provided in the response payload', () => {
      when(jwtDecoder.decode('somejwt')).thenReturn({
        iat: 1616074548,
        payload: {
          requestreference: '123456',
          version: '1.00',
          jwt: 'updatedjwt',
          response: [
            {
              aaa: 'aaa',
              bbb: 'bbb',
            },
          ],
          secrand: 'foobar',
        },
        aud: 'foo',
        sitereference: 'bar',
      });

      const result = responseDecoderService.decode(prepareResponse({ jwt: 'somejwt' }));

      expect(result).toEqual({
        responseJwt: 'somejwt',
        requestreference: '123456',
        updatedMerchantJwt: 'updatedjwt',
        customerOutput: {
          aaa: 'aaa',
          bbb: 'bbb',
        },
      });
    });
  });
});
