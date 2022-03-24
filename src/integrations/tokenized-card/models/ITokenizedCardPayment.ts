import { IStRequest } from '../../../application/core/models/IStRequest';
import { IStyle } from '../../../shared/model/config/IStyle';

export interface ITokenizedCardPaymentConfig {
  buttonId?: string;
  securityCodeSlotId?: string;
  formId?: string;
  placeholder?: string;
  style?: IStyle;
}

export interface ITokenizedCardPayGatewayRequest {
  requestData: IStRequest,
  merchantUrl?: string
}
