import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { Money } from 'ts-money';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { APMAvailabilityMap } from '../../models/APMAvailabilityMap';
import { Debug } from '../../../../shared/Debug';
import { APMCountryIso } from '../../models/APMCountryIso';
import { APMCurrencyIso } from '../../models/APMCurrencyIso';
import { APMName } from '../../models/APMName';
import { APMValidator } from '../apm-validator/APMValidator';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { MisconfigurationError } from '../../../../shared/services/sentry/MisconfigurationError';

@Service()
export class APMFilterService {
  constructor(
    private jwtDecoder: JwtDecoder,
    private configProvider: ConfigProvider,
    private apmValidator: APMValidator,
    private sentryService: SentryService,
  ) {
  }

  filter(apmList: IAPMItemConfig[], jwt?: string): Observable<IAPMItemConfig[]> {
    const jwtString = jwt || this.configProvider.getConfig().jwt;
    const jwtPayload = this.jwtDecoder.decode<IStJwtPayload>(jwtString).payload;
    const unavailableAPMs: APMName[] = [];

    const availableAPMs = apmList.filter((item: IAPMItemConfig) => {
      if (this.isAPMAvailable(item, jwtPayload)) {
        return true;
      }

      unavailableAPMs.push(item.name);

      return false;
    });

    if (unavailableAPMs.length > 0) {
      console.warn(`The following APMs have been hidden due to configuration incompatibility: ${unavailableAPMs.join(', ')}`);
    }

    return of(availableAPMs);
  }

  isAPMAvailable(item: IAPMItemConfig, payload: IStJwtPayload): boolean {
    return APMAvailabilityMap.has(item.name) &&
      this.isItemConfigValid(item) &&
      this.isJwtPayloadValid(item, payload) &&
      this.isCountryAvailable(item, payload.billingcountryiso2a as APMCountryIso) &&
      this.isCurrencyAvailable(item, payload.currencyiso3a as APMCurrencyIso) &&
      this.isAmountInLimits(item, payload)
    ;
  }

  private isItemConfigValid(item: IAPMItemConfig): boolean {
    const validationError = this.apmValidator.validateItemConfig(item);
    console.log(item, validationError)

    if (validationError) {
      this.sentryService.sendCustomMessage(new MisconfigurationError(`Misconfiguration: Configuration for ${item.name} APM is invalid: ${validationError.message}`));
      Debug.warn(`Configuration for ${item.name} APM is invalid: ${validationError.message}`);

      return false;
    }

    return true;
  }

  private isJwtPayloadValid(item: IAPMItemConfig, payload: IStJwtPayload): boolean {
    const validationError = this.apmValidator.validateJwt(item, payload);

    if (validationError) {
      Debug.warn(`JWT configuration for ${item.name} APM is invalid: ${validationError.message}`);

      return false;
    }

    return true;
  }

  private isCountryAvailable(item: IAPMItemConfig, country: APMCountryIso): boolean {
    const countries = APMAvailabilityMap.get(item.name).countries;
    const countryAvailable = !countries.length || countries.includes(country);

    if (!countryAvailable) {
      Debug.warn(`Billing country ${country} is not available for ${item.name}.`);
    }

    return countryAvailable;
  }

  private isCurrencyAvailable(item: IAPMItemConfig, currency: APMCurrencyIso): boolean {
    const currencies = APMAvailabilityMap.get(item.name).currencies;
    const currencyAvailable = !currencies.length || currencies.includes(currency);

    if (!currencyAvailable) {
      Debug.warn(`Billing currency ${currency} is not available for ${item.name}.`);
    }

    return currencyAvailable;
  }

  private isAmountInLimits(item: IAPMItemConfig, payload: IStJwtPayload): boolean {
    if (!item.minBaseAmount && !item.maxBaseAmount) {
      return true;
    }

    const { baseamount, currencyiso3a, mainamount } = payload;
    const amountInMinorUnits: number = (mainamount === undefined ?
      Money.fromInteger(Number(baseamount), currencyiso3a) :
      Money.fromDecimal(Number(mainamount), currencyiso3a)).getAmount();

    if (item.minBaseAmount && amountInMinorUnits < item.minBaseAmount) {
      Debug.warn(`Payment amount (${amountInMinorUnits}) is lower than minimal value (${item.minBaseAmount}) for ${item.name}.`);

      return false;
    }

    if (item.maxBaseAmount && amountInMinorUnits > item.maxBaseAmount) {
      Debug.warn(`Payment amount (${amountInMinorUnits}) is greater than maximal value (${item.maxBaseAmount}) for ${item.name}.`);

      return false;
    }

    return true;
  }
}
