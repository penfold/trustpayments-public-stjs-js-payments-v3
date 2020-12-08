import { IVisaCheckoutSettings } from './IVisaCheckoutSettings';
import { IVisaCheckoutButtonSettings } from './visa-checkout-button-service/IVisaCheckoutButtonSettings';
import { IVisaCheckoutPaymentRequest } from './IVisaCheckoutPaymentRequest';

export interface IVisaCheckoutConfig {
  merchantId: string; // That's VisaCheckout apikey property
  livestatus: 0 | 1;
  encryptionKey?: string;
  placement: string;
  buttonSettings?: IVisaCheckoutButtonSettings;
  settings?: IVisaCheckoutSettings;
  paymentRequest?: IVisaCheckoutPaymentRequest;
}
