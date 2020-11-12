export interface IVisaButtonSettings {
  readonly [index: string]: string | number;
  size?: 154 | 213 | 425;
  height?: 34 | 47 | 94;
  width?: number;
  locale?: string;
  color?: 'neutral' | 'standard';
  cardBrands?: 'VISA' | 'MASTERCARD' | 'AMEX' | 'DISCOVER' | 'ELECTRON' | 'ELO';
  acceptCanadianVisaDebit?: 'true' | 'false';
  cobrand?: 'true' | 'false';
}
