import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import { JwtProvider } from '../../../shared/services/jwt-provider/JwtProvider';
import { LocaleProvider } from './LocaleProvider';

describe('LocaleProvider', () => {
  let sut: LocaleProvider;
  let jwtProvider: JwtProvider;

  beforeEach(() => {
    jwtProvider = mock(JwtProvider);

    when(jwtProvider.getJwtPayload()).thenReturn(of({ locale: 'fr_FR' }));

    sut = new LocaleProvider(instance(jwtProvider));
  });

  describe('getUserLocaleFromJwt', () => {
    it('returns current locale', () => {
      expect(sut.getUserLocaleFromJwt()).toBe('fr_FR');
    });
  });
});
