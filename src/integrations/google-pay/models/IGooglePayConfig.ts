import { IGooglePayButtonOptions } from './IGooglePayButton';
import { IGooglePayPaymentRequest } from './IGooglePayPaymentRequest';

export const GooglePayConfigName = 'googlePay';

export const GooglePayTestEnvironment = 'TEST';
export const GooglePayProductionEnvironment = 'PRODUCTION';

export interface IGooglePayConfig {
  buttonOptions: IGooglePayButtonOptions;
  merchantUrl?: string;
  paymentRequest: IGooglePayPaymentRequest;
}
