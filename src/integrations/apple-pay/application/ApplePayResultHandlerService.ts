import { Subject } from 'rxjs/dist/types/internal/Subject';
import { Service } from 'typedi';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';

@Service()
export class ApplePayResultHandlerService {
  constructor(
    private googleAnalytics: GoogleAnalytics,
  ) {}

  handleWalletVerifyResult(response: IRequestTypeResponse, paymentResult: Subject<IPaymentResult<IRequestTypeResponse>>): void {
    if (Number(response.errorcode) !== 0) {
      paymentResult.next({
        status: PaymentStatus.FAILURE,
        data: response,
        error: {
          code: Number(response.errorcode),
          message: response.errormessage,
        },
      });
    }
    this.googleAnalytics.sendGaData('event', 'Apple Pay', 'walletverify', 'Apple Pay walletverify success');
  }
  
  handleWalletVerifyError(error: Error, paymentResult: Subject<IPaymentResult<IRequestTypeResponse>>): void {
    paymentResult.error({
      status: PaymentStatus.ERROR,
      data: error,
      error: {
        code: 50003,
        message: error.message,
      },
    });
    this.googleAnalytics.sendGaData('event', 'Apple Pay', 'walletverify', 'Apple Pay walletverify failure');
  }

  handlePaymentResult(response: IRequestTypeResponse, paymentResult: Subject<IPaymentResult<IRequestTypeResponse>>): void {
    if (Number(response.errorcode) === 0) {
      paymentResult.next({
        status: PaymentStatus.SUCCESS,
        data: response,
        error: {
          code: Number(response.errorcode),
          message: response.errormessage,
        },
      });
      this.googleAnalytics.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment completed');
    } else {
      paymentResult.next({
        status: PaymentStatus.FAILURE,
        data: response,
        error: {
          code: Number(response.errorcode),
          message: response.errormessage,
        },
      });
      this.googleAnalytics.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment failure');
    }
  }

  handlePaymentError(error: Error, paymentResult: Subject<IPaymentResult<IRequestTypeResponse>>): void {
    paymentResult.error({
      status: PaymentStatus.ERROR,
      data: error,
      error: {
        code: 50003,
        message: error.message,
      },
    });
    this.googleAnalytics.sendGaData('event', 'Apple Pay', 'payment', 'Apple Pay payment error');
  }
}
