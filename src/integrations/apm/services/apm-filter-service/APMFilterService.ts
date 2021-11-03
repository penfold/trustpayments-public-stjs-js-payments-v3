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

@Service()
export class APMFilterService {
  constructor(
    private jwtDecoder: JwtDecoder,
    private configProvider: ConfigProvider,
  ) {
  }

  filter(apmList: IAPMItemConfig[], jwt?: string): Observable<IAPMItemConfig[]> {
    return of(apmList.filter((item: IAPMItemConfig) => this.isAPMAvailable(item, this.getJwtPayload(jwt ? jwt : this.configProvider.getConfig().jwt))));
  }

  private getJwtPayload(jwt: string): IStJwtPayload {
    return this.jwtDecoder.decode<IStJwtPayload>(jwt).payload;
  }

  private isAPMAvailable(item: IAPMItemConfig, payload: IStJwtPayload): boolean {
    if (!APMAvailabilityMap.has(item.name)) {
      Debug.error(`Payment method ${item.name} is not available.`);

      return false;
    }

    if (!APMAvailabilityMap.get(item.name).currencies.includes(payload.currencyiso3a as APMCurrencyIso)) {
      Debug.error(`Your currency: ${payload.currencyiso3a} is not supported by ${item.name}.`);

      return false;
    }

    if (!APMAvailabilityMap.get(item.name).countries.includes(payload.billingcountryiso2a as APMCountryIso) && APMAvailabilityMap.get(item.name).countries.length !== 0) {
      Debug.error(`Your country: ${payload.billingcountryiso2a} is not supported by ${item.name}.`);

      return false;
    }

    if (APMAvailabilityMap.get(item.name).payload.find((property: IStJwtPayload) => !Object.keys(payload).includes(property as string))) {
      Debug.error('Jwt does not include some of the required fields');

      return false;
    }

    return true;
  }
}
