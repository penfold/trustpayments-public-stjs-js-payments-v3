import { IVisaCheckoutInitConfig } from '../IVisaCheckoutInitConfig';

export interface IVisaCheckoutUpdateConfig {
  buttonUrl: string;
  sdkUrl: string;
  visaInitConfig: IVisaCheckoutInitConfig;
}
