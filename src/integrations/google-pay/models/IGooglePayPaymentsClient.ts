import { IGooglePayPaymentRequest, IGooglePlayIsReadyToPayRequest, IPaymentResponse } from './IGooglePayPaymentRequest';

export interface IGooglePayButtonOptions {
  buttonColor: string;
  buttonType: string;
  buttonLocale: string;
  onClick: () => void;
}

export interface IIsReadyToPayResponse {
  result: boolean;
}

export interface IGooglePaySessionPaymentsClient {
  createButton(options: IGooglePayButtonOptions): Node;
  loadPaymentData(request: IGooglePayPaymentRequest): Promise<IPaymentResponse>;
  isReadyToPay(request: IGooglePlayIsReadyToPayRequest): Promise<IIsReadyToPayResponse>;
}
