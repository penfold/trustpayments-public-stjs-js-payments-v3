export interface IVisaButtonSettings {
  size?: 154 | 213 | 425;
  height?: 34 | 47 | 94;
  width?: number;
  locale?: string;
  color?: 'neutral' | 'standard';
  cardBrands?: string;
  acceptCanadianVisaDebit?: 'true' | 'false';
  cobrand?: 'true' | 'false';
}
