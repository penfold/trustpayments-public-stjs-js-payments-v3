import { IVisaCheckoutStatusDataInitRequest } from './IVisaCheckoutStatusDataInitRequest';

export interface IVisaCheckoutStatusDataCancel {
  callid: string | null;
  isCancelFromDCF: boolean;
  vInitRequest: IVisaCheckoutStatusDataInitRequest;
  why: 'CANCEL_SRC' | '';
}
