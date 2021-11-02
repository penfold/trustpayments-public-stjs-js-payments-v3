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
import { APMBillingNameFields } from '../../models/APMPayloadFields';

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

  private isBillingNameFieldInJwt(payload: IStJwtPayload): boolean {
    return Object.keys(payload).some((property: string) => APMBillingNameFields.includes(property) && payload[property].length !== 0);
  }

  private isAPMAvailable(item: IAPMItemConfig, payload: IStJwtPayload): boolean {
    if (!this.isBillingNameFieldInJwt(payload)) {
      Debug.log(`Provided jwt does not include one of the required fields: ${APMBillingNameFields}.`);

      return false;
    }

    if (!APMAvailabilityMap.has(item.name)) {
      Debug.log(`Payment method ${item.name} is not available.`);

      return false;
    }

    if (!APMAvailabilityMap.get(item.name).currencies.includes(payload.currencyiso3a as APMCurrencyIso)) {
      Debug.log(`Your currency: ${payload.currencyiso3a} is not supported by ${item.name}.`);

      return false;
    }

    if (!APMAvailabilityMap.get(item.name).countries.includes(payload.billingcountryiso2a as APMCountryIso) && APMAvailabilityMap.get(item.name).countries.length !== 0) {
      Debug.log(`Your country: ${payload.billingcountryiso2a} is not supported by ${item.name}.`);

      return false;
    }

    return !(APMAvailabilityMap.get(item.name).payload.find((property: IStJwtPayload) => !Object.keys(payload).includes(property as string)));
  }
}
