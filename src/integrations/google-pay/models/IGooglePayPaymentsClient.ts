import { IGooglePayPaymentRequest, IGooglePlayIsReadyToPayRequest } from './IGooglePayPaymentRequest';

export interface IGooglePayButtonOptions {
  buttonColor: string;
  buttonType: string;
  buttonLocale: string;
  onClick: () => void;
}

export interface IGooglePaySessionPaymentsClient {
  createButton(options: IGooglePayButtonOptions): Node;
  loadPaymentData(request: IGooglePayPaymentRequest): Promise<any>;
  isReadyToPay(request: IGooglePlayIsReadyToPayRequest): Promise<any>;
}
