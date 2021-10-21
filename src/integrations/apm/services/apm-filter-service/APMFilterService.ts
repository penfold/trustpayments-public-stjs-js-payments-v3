import { EMPTY, Observable, of, switchMap } from 'rxjs';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { APMAvailabilityMap } from '../../models/APMAvailabilityMap';
import { Service } from 'typedi';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { IUpdateJwt } from '../../../../application/core/models/IUpdateJwt';

@Service()
export class APMFilterService {
  private currency: string;
  private country: string;

  constructor(private jwtDecoder: JwtDecoder, private configProvider: ConfigProvider, private messageBus: IMessageBus) {
    this.messageBus.subscribeType(PUBLIC_EVENTS.UPDATE_JWT, (data: IUpdateJwt) => {

    });
    this.init$();
  }

  private init$(): Observable<any> {
    return this.configProvider.getConfig$().pipe(
      switchMap((config: IConfig) => {
        const { currencyiso3a, locale } = this.jwtDecoder.decode<IStJwtPayload>(config.jwt).payload;
        return EMPTY;
      }),
    );
  }

  filter(apmList: IAPMItemConfig[]): Observable<IAPMItemConfig[]> {
    const { currencyiso3a, locale } = this.jwtDecoder.decode<IStJwtPayload>(this.configProvider.getConfig().jwt).payload;
    return of(apmList.filter((item: IAPMItemConfig) => {
      return APMAvailabilityMap.has(item.name) &&
        APMAvailabilityMap.get(item.name).currencies.includes(currencyiso3a) &&
        APMAvailabilityMap.get(item.name).countries.includes(locale)
    }));
  }
}
