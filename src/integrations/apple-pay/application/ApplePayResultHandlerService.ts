import { Subject } from 'rxjs/dist/types/internal/Subject';
import { Service } from 'typedi';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';

@Service()
export class ApplePayResultHandlerService {
  constructor() {}

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
    } else {
      paymentResult.next({
        status: PaymentStatus.FAILURE,
        data: response,
        error: {
          code: Number(response.errorcode),
          message: response.errormessage,
        },
      });
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
  }
}
