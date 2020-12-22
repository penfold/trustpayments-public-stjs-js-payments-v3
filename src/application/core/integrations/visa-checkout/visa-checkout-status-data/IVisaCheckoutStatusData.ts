import { IVisaCheckoutStatusDataCancel } from './IVisaCheckoutStatusDataCancel';
import { IVisaCheckoutStatusDataError } from './IVisaCheckoutStatusDataError';
import { IVisaCheckoutStatusDataPrePayment } from './IVisaCheckoutStatusDataPrePayment';
import { IVisaCheckoutStatusDataSuccess } from './IVisaCheckoutStatusDataSuccess';

export type IVisaCheckoutStatusData =
  | IVisaCheckoutStatusDataSuccess
  | IVisaCheckoutStatusDataCancel
  | IVisaCheckoutStatusDataError
  | IVisaCheckoutStatusDataPrePayment;
