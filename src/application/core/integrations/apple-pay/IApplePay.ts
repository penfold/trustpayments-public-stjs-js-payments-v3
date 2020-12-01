import { IApplePayPaymentRequest } from './IApplePayPaymentRequest';
import { RequestType } from '../../../../shared/types/RequestType';

export interface IApplePay {
  buttonStyle: string;
  buttonText: string;
  merchantId: string;
  paymentRequest: IApplePayPaymentRequest;
  placement: string;
  requestTypes: RequestType[];
}
