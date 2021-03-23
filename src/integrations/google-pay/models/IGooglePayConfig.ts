import { IGooglePayButtonOptions } from './IGooglePayButton';
import { IGooglePayPaymentRequest } from './IGooglePayPaymentRequest';

export const IGooglePayConfigName = 'googlePay';

export interface IGooglePayConfig {
  buttonOptions: IGooglePayButtonOptions;
  paymentRequest: IGooglePayPaymentRequest;
}
