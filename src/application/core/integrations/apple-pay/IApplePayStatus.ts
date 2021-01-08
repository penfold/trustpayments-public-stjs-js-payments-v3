import { IApplePayClientStatus } from './IApplePayClientStatus';

export interface IApplePayStatus {
  type: 'ST_APPLE_PAY_STATUS';
  data: IApplePayClientStatus;
}
