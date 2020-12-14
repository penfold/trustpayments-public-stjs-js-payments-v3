import { ApplePayErrorCodes } from '../../../application/core/integrations/apple-pay/apple-pay-error-service/ApplePayErrorCodes';
import { IMerchantData } from '../../../application/core/models/IMerchantData';
import { ApplePayClientStatus } from './ApplePayClientStatus';

export interface IApplePayClientStatus {
  status: ApplePayClientStatus;
  data: {
    errorcode: ApplePayErrorCodes;
    errormessage: string;
  };
  merchantData?: IMerchantData; // For success callback only
}
