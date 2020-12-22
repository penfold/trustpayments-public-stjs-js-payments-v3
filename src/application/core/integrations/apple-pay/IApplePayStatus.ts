import { IApplePayClientStatus } from '../../../../client/integrations/apple-pay/IApplePayClientStatus';

export interface IApplePayStatus {
  type: 'ST_APPLE_PAY_STATUS';
  data: IApplePayClientStatus;
}
