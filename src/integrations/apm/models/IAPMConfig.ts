import { APMName } from './APMName';
import { IAPMItemConfig } from './IAPMItemConfig';

export const APMNameList = ['alipayinapp', 'americanexp', 'bancontact', 'epsuberweisung', 'giropay', 'ideal', 'multibanco', 'mybank', 'paysafecard', 'payu', 'postfinance', 'przelewy24', 'redpagos', 'safetypay', 'sepa', 'sofort', 'trustly', 'unionpay', 'wechat'];

export interface IAPMConfig {
  placement: string;
  successRedirectUrl: string;
  errorRedirectUrl: string;
  cancelRedirectUrl: string;
  apmList: Array<APMName | IAPMItemConfig>;
}
