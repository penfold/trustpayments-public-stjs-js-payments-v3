import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import { IStJwtPayload } from '../../../application/core/models/IStJwtPayload';
import { ConfigProvider } from '../config-provider/ConfigProvider';
import { JwtDecoder } from '../jwt-decoder/JwtDecoder';
import { JwtProvider } from './JwtProvider';

describe('JwtProvider', () => {
  const JWT = 'somejwt';
  const payload: IStJwtPayload = {
    baseamount: '100',
  };

  let configProviderMock: ConfigProvider;
  let jwtDecoderMock: JwtDecoder;
  let jwtProvider: JwtProvider;

  beforeEach(() => {
    configProviderMock = mock<ConfigProvider>();
    jwtDecoderMock = mock(JwtDecoder);
    jwtProvider = new JwtProvider(
      instance(configProviderMock),
      instance(jwtDecoderMock),
    );

    when(configProviderMock.getConfig$()).thenReturn(of({ jwt: JWT }));
    when(jwtDecoderMock.decode(JWT)).thenReturn({ payload });
  });

  describe('getRawJwt()', () => {
    it('returns raw jwt from config', done => {
      jwtProvider.getRawJwt().subscribe(result => {
        expect(result).toBe(JWT);
        done();
      });
    });

    it('returns decoded jwt payload from config', done => {
      jwtProvider.getJwtPayload().subscribe(result => {
        expect(result).toBe(payload);
        done();
      });
    });
  });
});
