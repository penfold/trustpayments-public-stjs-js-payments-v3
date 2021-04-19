import { IVisaCheckoutInitConfig } from '../IVisaCheckoutInitConfig';

export interface IVisaCheckoutUpdateConfig {
  buttonUrl: string;
  sdkUrl: string;
  merchantUrl?: string;
  visaInitConfig: IVisaCheckoutInitConfig;
}
