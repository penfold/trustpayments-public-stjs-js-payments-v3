import { IVisaCheckoutInitConfig } from '../IVisaCheckoutInitConfig';
import { IVisaCheckoutStatusData } from '../visa-checkout-status-data/IVisaCheckoutStatusData';
import { VisaCheckoutResponseType } from '../VisaCheckoutResponseType';

export interface IVisaCheckoutSdk {
  lib: IVisaCheckoutSdkLib;
}

export interface IVisaCheckoutSdkLib {
  init: (visaInitConfig: IVisaCheckoutInitConfig) => void;
  on: (callbackType: VisaCheckoutResponseType, callback: (statusData: IVisaCheckoutStatusData) => void) => void;
}
