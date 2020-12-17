import { ApplePayClientErrorCode } from './ApplePayClientErrorCode';
import { IMerchantData } from '../../../application/core/models/IMerchantData';
import { ApplePayClientStatus } from './ApplePayClientStatus';

export interface IApplePayClientStatus {
  status: ApplePayClientStatus;
  data: {
    errorCode: ApplePayClientErrorCode;
    errorMessage: string;
  };
  merchantData?: IMerchantData; // For success callback only
}
