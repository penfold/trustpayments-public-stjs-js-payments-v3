import { IApplePayClientStatusDetails } from './IApplePayClientStatusDetails';
import { ApplePayClientStatus } from './ApplePayClientStatus';

export interface IApplePayClientStatus {
  status: ApplePayClientStatus;
  details: IApplePayClientStatusDetails;
}
