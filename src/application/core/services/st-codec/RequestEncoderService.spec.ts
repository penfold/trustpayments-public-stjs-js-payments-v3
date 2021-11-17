import { mock, instance, when } from 'ts-mockito';
import { Store } from '../../store/store/Store';
import { IStore } from '../../store/IStore';
import { IApplicationFrameState } from '../../store/state/IApplicationFrameState';
import { COMMUNICATION_ERROR_INVALID_REQUEST } from '../../models/constants/Translations';
import { RequestEncoderService } from './RequestEncoderService';
import { InvalidRequestError } from './InvalidRequestError';

describe('RequestEncoderService', () => {
  let str: RequestEncoderService;
  let storeMock: IStore<IApplicationFrameState>;

  describe('encode', () => {
    beforeEach(() => {
      storeMock = mock(Store);
      str = new RequestEncoderService(instance(storeMock));

      const statePayload = {
        jwt: 'somejwt',
        storage: {},
      };
      when(storeMock.getState()).thenReturn(statePayload);
    });

    it('encode request with correct payload', () => {
      const request = { pan: '4111111111111111', requesttypedescriptions: ['AUTH', 'SUBSCRIPTION'] };
      const result = str.encode(request);

      expect(result).toEqual({
        acceptcustomeroutput: '2.00',
        jwt: 'somejwt',
        request: [
          {
            pan: '4111111111111111',
            requesttypedescriptions: ['AUTH', 'SUBSCRIPTION'],
            requestid: expect.any(String),
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
