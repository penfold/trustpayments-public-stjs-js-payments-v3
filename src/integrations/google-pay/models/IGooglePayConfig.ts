import { IGooglePayButtonOptions } from './IGooglePayButton';
import { IGooglePayPaymentRequest } from './IGooglePayPaymentRequest';

export const GooglePayConfigName = 'googlePay';

export const GooglePlayTestEnvironment = 'TEST';
export const GooglePlayProductionEnvironment = 'PRODUCTION';

export interface IGooglePayConfig {
  buttonOptions: IGooglePayButtonOptions;
  paymentRequest: IGooglePayPaymentRequest;
}
