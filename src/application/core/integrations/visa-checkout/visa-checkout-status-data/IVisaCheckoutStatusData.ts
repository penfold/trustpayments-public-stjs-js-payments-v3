import { IVisaCheckoutStatusDataCancel } from './IVisaCheckoutStatusDataCancel';
import { IVisaCheckoutStatusDataError } from './IVisaCheckoutStatusDataError';
import { IVisaCheckoutStatusDataPrePayment } from './IVisaCheckoutStatusDataPrePayment';
import { IVisaCheckoutStatusDataSuccess } from './IVisaCheckoutStatusDataSuccess';

// tslint:disable-next-line:no-empty-interface
export type IVisaCheckoutStatusData =
  | IVisaCheckoutStatusDataSuccess
  | IVisaCheckoutStatusDataCancel
  | IVisaCheckoutStatusDataError
  | IVisaCheckoutStatusDataPrePayment;
