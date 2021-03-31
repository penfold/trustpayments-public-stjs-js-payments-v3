import { mock, instance, when } from 'ts-mockito';
import { RequestEncoderService } from './RequestEncoderService';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { Store } from '../../store/store/Store';
import { IStore } from '../../store/IStore';
import { IApplicationFrameState } from '../../store/state/IApplicationFrameState';
import { COMMUNICATION_ERROR_INVALID_REQUEST } from '../../models/constants/Translations';
import { InvalidRequestError } from './InvalidRequestError';

describe('RequestEncoderService', () => {
  let str: RequestEncoderService;
  let storeMock: IStore<IApplicationFrameState>;
  let jwtDecoderMock: JwtDecoder;

  describe('encode', () => {
    beforeEach(() => {
      jwtDecoderMock = mock(JwtDecoder);
      storeMock = mock(Store);
      str = new RequestEncoderService(instance(jwtDecoderMock), instance(storeMock));

      const payload = { payload: {}, sitereference: 'foo' };
      const statePayload = {
        jwt: 'somejwt',
        storage: {},
      };
      when(jwtDecoderMock.decode(statePayload.jwt)).thenReturn(payload);
      when(storeMock.getState()).thenReturn(statePayload);
    });

    it('encode request with correct payload', () => {
      const request = { pan: '4111111111111111', requesttypedescriptions: ['AUTH', 'SUBSCRIPTION'] };
      const result = str.encode(request);

      expect(typeof result === 'string' && JSON.parse(result)).toEqual({
        acceptcustomeroutput: '2.00',
        jwt: 'somejwt',
        request: [
          {
            pan: '4111111111111111',
            requesttypedescriptions: ['AUTH', 'SUBSCRIPTION'],
            requestid: expect.any(String),
            sitereference: 'foo',
          },
        ],
        version: '1.00',
        versioninfo: 'STJS::N/A::0.0.0::N/A',
      });
    });

    it('throw an error when payload is incorrect', () => {
      const request = {};
      expect(() => str.encode(request)).toThrow(new InvalidRequestError(COMMUNICATION_ERROR_INVALID_REQUEST));
    });
  });
});
