import { Observable, of } from 'rxjs';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { APMAvailabilityMap } from '../../models/APMAvailabilityMap';
import { Service } from 'typedi';

@Service()
export class APMFilterService {
  constructor(
    private jwtDecoder: JwtDecoder,
    private configProvider: ConfigProvider,
  ) {
  }

  filter(apmList: IAPMItemConfig[], jwt?: string): Observable<IAPMItemConfig[]> {
    const { country, currency } = this.getCurrencyAndCountry(jwt ? jwt : this.configProvider.getConfig().jwt);
    console.error(country, currency);

    return of(apmList.filter((item: IAPMItemConfig) => this.isAPMAvailable(item, currency, country)));
  }

  private getCurrencyAndCountry(jwt: string): { currency: string, country: string } {
    return {
      currency: this.jwtDecoder.decode<IStJwtPayload>(jwt).payload.currencyiso3a,
      country: this.jwtDecoder.decode<IStJwtPayload>(jwt).payload.billingcountryiso2a,
    };
  }

  private isAPMAvailable(item: IAPMItemConfig, currencyiso3a: string, countryiso: string): boolean {
    return APMAvailabilityMap.has(item.name) &&
      APMAvailabilityMap.get(item.name).currencies.includes(currencyiso3a) &&
      APMAvailabilityMap.get(item.name).countries.includes(countryiso);
  }
}
