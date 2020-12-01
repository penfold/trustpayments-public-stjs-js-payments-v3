import { IVisaCheckoutStatusData } from '../../../application/core/integrations/visa-checkout/visa-checkout-status-data/IVisaCheckoutStatusData';
import { VisaCheckoutClientStatus } from './VisaCheckoutClientStatus';

export interface IVisaCheckoutClientStatus {
  status: VisaCheckoutClientStatus;
  data: IVisaCheckoutStatusData;
}
