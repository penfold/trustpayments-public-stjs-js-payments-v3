import { IStyles } from '../../../shared/model/config/IStyles';
import { Locale } from '../shared/translator/Locale';

export interface IParams {
  [name: string]: Record<string, unknown> | IStyles[] | string;
  styles?: IStyles[];
  locale?: Locale;
  origin?: string;
  jwt?: string;
  gatewayUrl?: string;
  paymentTypes?: string;
  defaultPaymentType?: string;
}
