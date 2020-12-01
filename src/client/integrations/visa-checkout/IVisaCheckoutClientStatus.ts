import { IVisaCheckoutStatusData } from '../../../application/core/integrations/visa-checkout/visa-checkout-status-data/IVisaCheckoutStatusData';
import { IMerchantData } from '../../../application/core/models/IMerchantData';
import { VisaCheckoutClientStatus } from './VisaCheckoutClientStatus';

export interface IVisaCheckoutClientStatus {
  status: VisaCheckoutClientStatus;
  data: IVisaCheckoutStatusData;
  merchantData?: IMerchantData; // for success callback only
}
