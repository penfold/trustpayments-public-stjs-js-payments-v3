import { ApplePayErrorCodes } from '../../../application/core/integrations/apple-pay/apple-pay-error-service/ApplePayErrorCodes';

export interface IApplePayClientStatus {
  status: string;
  data: {
    errorcode: ApplePayErrorCodes;
    errormessage: string;
  };
}
