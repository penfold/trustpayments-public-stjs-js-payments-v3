import { IGooglePayButtonOptions } from './IGooglePayButton';
import { IGooglePayPaymentRequest } from './IGooglePayPaymentRequest';

export interface IGooglePayConfig {
  buttonOptions: IGooglePayButtonOptions;
  paymentRequest: IGooglePayPaymentRequest;
}
