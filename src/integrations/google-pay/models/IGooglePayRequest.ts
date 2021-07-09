import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';

export interface IGooglePayGatewayRequest {
  [key: string]: string;
  resultStatus?: PaymentStatus;
  walletsource?: string;
  wallettoken?: string;
}
