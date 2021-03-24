import { IGooglePayButtonOptions } from './IGooglePayButton';
import { IGooglePayPaymentRequest } from './IGooglePayPaymentRequest';

export const GooglePayConfigName = 'googlePay';

export interface IGooglePayConfig {
  buttonOptions: IGooglePayButtonOptions;
  paymentRequest: IGooglePayPaymentRequest;
}
