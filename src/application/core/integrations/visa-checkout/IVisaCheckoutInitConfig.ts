import { IVisaCheckoutSettings } from './IVisaCheckoutSettings';
import { IVisaCheckoutPaymentRequest } from './IVisaCheckoutPaymentRequest';

export interface IVisaCheckoutInitConfig {
  apikey: string;
  encryptionKey?: string;
  referenceCallID?: string;
  externalProfileId?: string;
  externalClientId?: string;
  settings?: IVisaCheckoutSettings;
  paymentRequest?: IVisaCheckoutPaymentRequest;
}
