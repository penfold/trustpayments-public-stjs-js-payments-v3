import { IVisaSettings } from './IVisaSettings';
import { IVisaPaymentRequest } from './IVisaPaymentRequest';

export interface IVisaInitConfig {
  apikey: string;
  encryptionKey?: string;
  settings?: IVisaSettings;
  paymentRequest?: IVisaPaymentRequest;
}
