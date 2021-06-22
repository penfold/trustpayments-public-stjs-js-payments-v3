import { IGooglePayMerchantInfo } from '../../../application/core/integrations/google-pay/models/IGooglePayPaymentRequest';
import { IGooglePaySessionPaymentsClient } from './IGooglePayPaymentsClient';

interface IPaymentsClient {
  environment: string,
  MerchantInfo?: IGooglePayMerchantInfo,
}

export interface IGoogleClient {
  payments: {
    api: {
      PaymentsClient: {
        new (paymentOptions: IPaymentsClient): IGooglePaySessionPaymentsClient,
      },
    }
  }
}
