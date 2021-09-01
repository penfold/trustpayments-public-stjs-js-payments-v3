import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';

export interface IApplePayGatewayRequest {
  [key: string]: string;
  resultStatus?: PaymentStatus;
  walletsource?: string;
  wallettoken?: string;
  fraudcontroltransactionid?: string;
};