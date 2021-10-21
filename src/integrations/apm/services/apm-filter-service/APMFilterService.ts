import { Observable, of } from 'rxjs';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { APMAvailabilityMap } from '../../models/APMAvailabilityMap';
import { Service } from 'typedi';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { IUpdateJwt } from '../../../../application/core/models/IUpdateJwt';

@Service()
export class APMFilterService {
  constructor(private jwtDecoder: JwtDecoder, private configProvider: ConfigProvider, private messageBus: IMessageBus) {
    this.messageBus.subscribeType(PUBLIC_EVENTS.UPDATE_JWT, (data: IUpdateJwt) => {
      const { country, currency } = this.getCurrencyAndCountry(data.newJwt);
      this.messageBus.publish({ data: { country, currency }, type: PUBLIC_EVENTS.APM_CURRENCY_AND_COUNTRY });
    });
  }

  filter(apmList: IAPMItemConfig[]): Observable<IAPMItemConfig[]> {
    const { country, currency } = this.getCurrencyAndCountry(this.configProvider.getConfig().jwt);

    return of(apmList.filter((item: IAPMItemConfig) => this.isAPMAvailable(item, currency, country)));
  }

  private getCurrencyAndCountry(jwt: string): { currency: string, country: string } {

    return {
      currency: this.jwtDecoder.decode<IStJwtPayload>(jwt).payload.currencyiso3a,
      country: this.jwtDecoder.decode<IStJwtPayload>(jwt).payload.locale,
    };
  }

  private isAPMAvailable(item: IAPMItemConfig, currencyiso3a: string, locale: string): boolean {
    return APMAvailabilityMap.has(item.name) &&
      APMAvailabilityMap.get(item.name).currencies.includes(currencyiso3a) &&
      APMAvailabilityMap.get(item.name).countries.includes(locale);
  }
}
