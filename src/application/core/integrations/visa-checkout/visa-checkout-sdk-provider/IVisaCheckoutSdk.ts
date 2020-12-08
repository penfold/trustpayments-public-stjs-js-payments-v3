import { IVisaCheckoutInitConfig } from '../IVisaCheckoutInitConfig';
import { IVisaCheckoutStatusData } from '../visa-checkout-status-data/IVisaCheckoutStatusData';
import { IVisaCheckoutUpdateConfig } from '../visa-checkout-update-service/IVisaCheckoutUpdateConfig';
import { VisaCheckoutResponseType } from '../VisaCheckoutResponseType';

export interface IVisaCheckoutSdk {
  lib: IVisaCheckoutSdkLib;
  updateConfig: IVisaCheckoutUpdateConfig;
}

export interface IVisaCheckoutSdkLib {
  init: (visaInitConfig: IVisaCheckoutInitConfig) => void;
  on: (callbackType: VisaCheckoutResponseType, callback: (statusData: IVisaCheckoutStatusData) => void) => void;
}
