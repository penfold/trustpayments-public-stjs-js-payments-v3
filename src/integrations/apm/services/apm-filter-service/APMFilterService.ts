import { Observable, of } from 'rxjs';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { APMAvailabilityMap } from '../../models/APMAvailabilityMap';
import { Service } from 'typedi';
import { Debug } from '../../../../shared/Debug';
import { APMCountryIso } from '../../models/APMCountryIso';
import { APMCurrencyIso } from '../../models/APMCurrencyIso';
import { APMName } from '../../models/APMName';

@Service()
export class APMFilterService {
  constructor(
    private jwtDecoder: JwtDecoder,
    private configProvider: ConfigProvider,
  ) {
  }

  filter(apmList: IAPMItemConfig[], jwt?: string): Observable<IAPMItemConfig[]> {
    const payload: IStJwtPayload = this.getJwtPayload(jwt ? jwt : this.configProvider.getConfig().jwt);
    const unavailableAPMs = this.getUnavailableAPMs(payload);

    return of(apmList.filter((item: IAPMItemConfig) => this.isAPMAvailable(item, payload, unavailableAPMs)));
  }

  private getJwtPayload(jwt: string): IStJwtPayload {
    return this.jwtDecoder.decode<IStJwtPayload>(jwt).payload;
  }

  private getUnavailableAPMs(payload: IStJwtPayload) {
    const countries: APMName[] = [];
    const currencies: APMName[] = [];

    APMAvailabilityMap.forEach((value, key) => {
      if (!value.countries.includes(payload.billingcountryiso2a as APMCountryIso)) {
        countries.push(key);
      }

      if (!value.currencies.includes(payload.currencyiso3a as APMCurrencyIso)) {
        currencies.push(key);
      }
    });

    if (countries.length) {
      Debug.warn(`Your country: ${payload.billingcountryiso2a} is not supported by ${countries}.`);
    }

    if (currencies.length) {
      Debug.warn(`Your currency: ${payload.currencyiso3a} is not supported by ${currencies}.`);
    }

    return { countries, currencies };
  }

  private isAPMAvailable(item: IAPMItemConfig, payload: IStJwtPayload, unavailableAPMs: { countries: APMName[], currencies: APMName[] }): boolean {

    if (unavailableAPMs.countries.includes(item.name) || unavailableAPMs.currencies.includes(item.name)) {

      return false;
    }

    if (!APMAvailabilityMap.has(item.name)) {
      Debug.warn(`Payment method ${item.name} is not available.`);

      return false;
    }

    const undefinedFields = APMAvailabilityMap.get(item.name).payload.filter((property: IStJwtPayload) => !Object.keys(payload).includes(property as string));

    if (undefinedFields.length) {
      Debug.warn(`Jwt does not include ${undefinedFields} required by ${item.name}`);

      return false;
    }

    return true;
  }
}
