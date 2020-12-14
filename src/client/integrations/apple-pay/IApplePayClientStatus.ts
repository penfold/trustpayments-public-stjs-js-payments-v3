import { ApplePayErrorCodes } from '../../../application/core/integrations/apple-pay/apple-pay-error-service/ApplePayErrorCodes';
import { IMerchantData } from '../../../application/core/models/IMerchantData';

export interface IApplePayClientStatus {
  status: string;
  data: {
    errorcode: ApplePayErrorCodes;
    errormessage: string;
  };
  merchantData?: IMerchantData; // For success callback only
}
