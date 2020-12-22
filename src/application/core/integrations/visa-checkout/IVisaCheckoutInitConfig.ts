import { IVisaCheckoutSettings } from './IVisaCheckoutSettings';
import { IVisaCheckoutPaymentRequest } from './IVisaCheckoutPaymentRequest';

export interface IVisaCheckoutInitConfig {
  apikey: string;
  encryptionKey?: string;
  settings?: IVisaCheckoutSettings;
  paymentRequest?: IVisaCheckoutPaymentRequest;
}
