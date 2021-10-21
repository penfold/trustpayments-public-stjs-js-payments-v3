import { APMName } from './APMName';

export const APMAvailabilityMap: Map<APMName, { countries: string[], currencies: string[] }> = new Map()
  .set(APMName.ZIP, {
    countries: ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'en_GB', 'HKD', 'JPY', 'KRW', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'USD'],
    currencies: ['EUR', 'GBP', 'USD'],
  });
