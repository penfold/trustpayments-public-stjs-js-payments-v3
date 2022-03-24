import { IStyle } from '../../../shared/model/config/IStyle';

export interface ITokenizedCardPaymentConfig {
  buttonId?: string;
  securityCodeSlotId?: string;
  formId?: string;
  placeholder?: string;
  style?: IStyle;
}