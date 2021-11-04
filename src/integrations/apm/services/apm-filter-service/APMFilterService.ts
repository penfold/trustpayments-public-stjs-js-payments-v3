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
    const unavailableAPMs = this.getUnavailableAPMs(payload, apmList);

    return of(apmList.filter((item: IAPMItemConfig) => this.isAPMAvailable(item, payload, unavailableAPMs)));
  }

  private getJwtPayload(jwt: string): IStJwtPayload {
    return this.jwtDecoder.decode<IStJwtPayload>(jwt).payload;
  }

  private getUndefinedJwtFields(item: IAPMItemConfig, payload: IStJwtPayload): IStJwtPayload[] {
    return APMAvailabilityMap.get(item.name).payload.filter((property: IStJwtPayload) => !Object.keys(payload).includes(property as string));
  }

  private getUnavailableAPMs(payload: IStJwtPayload, apmList: IAPMItemConfig[]): { countries: APMName[], currencies: APMName[] } {
    let countries: APMName[] = [];
    let currencies: APMName[] = [];

    APMAvailabilityMap.forEach((value, key) => {
      if (!value.countries.includes(payload.billingcountryiso2a as APMCountryIso) && value.countries.length) {
        countries.push(key);
      }

      if (!value.currencies.includes(payload.currencyiso3a as APMCurrencyIso) && value.currencies.length) {
        currencies.push(key);
      }
    });

    countries = (apmList.map((item: IAPMItemConfig) => {
      if (countries.includes(item.name)) {
        return item.name;
      }
    })).filter(item => item);

    currencies = (apmList.map((item: IAPMItemConfig) => {
      if (currencies.includes(item.name)) {
        return item.name;
      }
    })).filter(item => item);

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

    const undefinedJwtFields = this.getUndefinedJwtFields(item, payload);

    if (undefinedJwtFields.length) {
      Debug.warn(`Jwt does not include ${undefinedJwtFields} required by ${item.name}`);

      return false;
    }

    return true;
  }
}
