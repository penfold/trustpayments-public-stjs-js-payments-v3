import { IStyle } from '../../../shared/model/config/IStyle';

export interface ITokenizedCardPaymentConfig {
  buttonId?: string;
  securityCodeSlotId?: string;
  formId?: string;
  placeholder?: string;
  styles?: IStyle;
}

export interface ITokenizedCardPaymentConfigDeprecated extends Omit<ITokenizedCardPaymentConfig, 'styles'> {
  style?: IStyle;
}

export interface ITokenizedCardPayGatewayRequest {
  formId: string;
  securitycode: string
  termurl: string
}
