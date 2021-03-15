import { IVisaCheckoutSettings } from './IVisaCheckoutSettings';
import { IVisaCheckoutButtonSettings } from './visa-checkout-button-service/IVisaCheckoutButtonSettings';
import { IVisaCheckoutPaymentRequest } from './IVisaCheckoutPaymentRequest';

export interface IVisaCheckoutConfig {
  merchantId: string; // That's VisaCheckout apikey property
  livestatus: 0 | 1;
  placement: string;
  encryptionKey?: string;
  referenceCallID?: string;
  externalProfileId?: string;
  externalClientId?: string;
  buttonSettings?: IVisaCheckoutButtonSettings;
  settings?: IVisaCheckoutSettings;
  paymentRequest?: IVisaCheckoutPaymentRequest;
}
