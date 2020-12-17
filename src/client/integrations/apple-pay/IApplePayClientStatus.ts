import { IApplePayClientErrorDetails } from './IApplePayClientErrorDetails';
import { ApplePayClientStatus } from './ApplePayClientStatus';

export interface IApplePayClientStatus {
  status: ApplePayClientStatus;
  data: IApplePayClientErrorDetails;
}
