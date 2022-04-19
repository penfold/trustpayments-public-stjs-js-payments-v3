import { Service } from 'typedi';
import { Locale } from '../../../application/core/shared/translator/Locale';
import { JwtProvider } from '../../../shared/services/jwt-provider/JwtProvider';

@Service()
export class LocaleProvider {
  private locale: Locale;

  constructor(
    private jwtProvider: JwtProvider,
  ) {
    this.getLocaleFromJwt();
  }

  private getLocaleFromJwt(): void {
    this.jwtProvider.getJwtPayload().subscribe(jwtPayload => this.locale = jwtPayload.locale);
  }

  getUserLocaleFromJwt(): Locale {
    return this.locale;
  }
}
