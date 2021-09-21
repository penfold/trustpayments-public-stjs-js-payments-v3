import { Service } from 'typedi';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { Observable, Subscriber, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Service()
export class ApplePayResponseHandlerService {
  handleWalletVerifyResponse(
    response: Observable<IRequestTypeResponse>,
    paymentResultSubscriber: Subscriber<IPaymentResult<IRequestTypeResponse>>,
  ): Observable<IRequestTypeResponse> {
    return response.pipe(
      tap(responseData => {
        if (Number(responseData.errorcode) !== 0) {
          paymentResultSubscriber.next({
            status: PaymentStatus.FAILURE,
            data: responseData,
            error: {
              code: Number(responseData.errorcode),
              message: responseData.errormessage,
            },
          });

          paymentResultSubscriber.complete();
        }
      }),
      catchError((error: Error) => {
        paymentResultSubscriber.error({
          status: PaymentStatus.ERROR,
          data: error,
          error: {
            code: 50003,
            message: error.message,
          },
        });

        return throwError(() => error);
      }),
    );
  }

  handlePaymentResponse(
    response: Observable<IRequestTypeResponse>,
    paymentResultSubscriber: Subscriber<IPaymentResult<IRequestTypeResponse>>,
  ): Observable<IRequestTypeResponse> {
    return response.pipe(
      tap(responseData => {
        if (Number(responseData.errorcode) === 0) {
          paymentResultSubscriber.next({
            status: PaymentStatus.SUCCESS,
            data: responseData,
          });
        } else {
          paymentResultSubscriber.next({
            status: PaymentStatus.FAILURE,
            data: responseData,
            error: {
              code: Number(responseData.errorcode),
              message: responseData.errormessage,
            },
          });
        }

        paymentResultSubscriber.complete();
      }),
      catchError(error => {
        paymentResultSubscriber.error({
          status: PaymentStatus.ERROR,
          data: error,
          error: {
            code: 50003,
            message: error.message,
          },
        });

        return throwError(() => error);
      }),
    );
  }
}
