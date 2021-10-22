import { Observable, of } from 'rxjs';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { APMAvailabilityMap } from '../../models/APMAvailabilityMap';
import { Service } from 'typedi';
import { Debug } from '../../../../shared/Debug';

@Service()
export class APMFilterService {
  constructor(
    private jwtDecoder: JwtDecoder,
    private configProvider: ConfigProvider,
  ) {
  }

  filter(apmList: IAPMItemConfig[], jwt?: string): Observable<IAPMItemConfig[]> {
    const { country, currency } = this.getCurrencyAndCountry(jwt ? jwt : this.configProvider.getConfig().jwt);

    return of(apmList.filter((item: IAPMItemConfig) => this.isAPMAvailable(item, currency, country)));
  }

  private getCurrencyAndCountry(jwt: string): { currency: string, country: string } {
    return {
      currency: this.jwtDecoder.decode<IStJwtPayload>(jwt).payload.currencyiso3a,
      country: this.jwtDecoder.decode<IStJwtPayload>(jwt).payload.billingcountryiso2a,
    };
  }

  private isAPMAvailable(item: IAPMItemConfig, currencyiso3a: string, countryiso: string): boolean {
    if (!APMAvailabilityMap.has(item.name)) {
      Debug.log(`Payment method ${item.name} is not available.`);
      return false;
    }

    if (!APMAvailabilityMap.get(item.name).currencies.includes(currencyiso3a)) {
      Debug.log(`Your currency: ${currencyiso3a} is not supported by ${item.name}.`);
      return false;
    }

    if (!APMAvailabilityMap.get(item.name).countries.includes(countryiso)) {
      Debug.log(`Your country: ${countryiso} is not supported by ${item.name}.`);
      return false;
    }

    return true;
  }
}
