import { anything, deepEqual, instance, mock, verify } from 'ts-mockito';
import { of, Subscriber, throwError } from 'rxjs';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { ApplePayPaymentMethodName } from '../models/IApplePayPaymentMethod';
import { ApplePayResponseHandlerService } from './ApplePayResponseHandlerService';

describe('ApplePayResponseHandlerService', () => {
  let applePayResponseHandlerService: ApplePayResponseHandlerService;
  let subscriberMock: Subscriber<IPaymentResult<IRequestTypeResponse>>;

  const response: IRequestTypeResponse = {
    errorcode: '0',
    customeroutput: '',
    errormessage: '',
    requesttypedescription: '',
    transactionstartedtimestamp: '',
    errordata: '',
  };

  beforeEach(() => {
    applePayResponseHandlerService = new ApplePayResponseHandlerService();
    subscriberMock = mock(Subscriber);
  });

  describe('handleWalletVerifyResponse()', () => {
    it('returns the original response observable', done => {
      applePayResponseHandlerService
        .handleWalletVerifyResponse(of(response), instance(subscriberMock))
        .subscribe(result => {
          expect(result).toBe(response);
          verify(subscriberMock.next(anything())).never();
          verify(subscriberMock.error(anything())).never();
          verify(subscriberMock.complete()).never();
          done();
        });
    });

    it('publishes FAILURE result to subscriber when response errorcode != 0', done => {
      const responseWithErrorCode = {
        ...response,
        errorcode: '123',
        errormessage: 'failed',
      };

      applePayResponseHandlerService
        .handleWalletVerifyResponse(of(responseWithErrorCode), instance(subscriberMock))
        .subscribe(() => {
          verify(subscriberMock.next(deepEqual({
            status: PaymentStatus.FAILURE,
            data: responseWithErrorCode,
            paymentMethodName: ApplePayPaymentMethodName,
            error: {
              code: 123,
              message: 'failed',
            },
          }))).once();
          verify(subscriberMock.complete()).once();
          done();
        });
    });

    it('publishes ERROR result if response observable returns an error', done => {
      const responseError = new Error('error');

      applePayResponseHandlerService
        .handleWalletVerifyResponse(throwError(() => responseError), instance(subscriberMock))
        .subscribe({
          error: (error) => {
            verify(subscriberMock.error(deepEqual({
              status: PaymentStatus.ERROR,
              data: responseError,
              error: {
                code: 50003,
                message: 'error',
              },
            }))).once();
            expect(error).toBe(responseError);
            done();
          },
        });
    });
  });

  describe('handlePaymentResponse()', () => {
    it('returns the original response observable', done => {
      applePayResponseHandlerService
        .handlePaymentResponse(of(response), instance(subscriberMock))
        .subscribe(result => {
          expect(result).toBe(response);
          done();
        });
    });

    it('publishes SUCCESS result to subscriber when response errorcode = 0', done => {
      applePayResponseHandlerService
        .handlePaymentResponse(of(response), instance(subscriberMock))
        .subscribe(() => {
          verify(subscriberMock.next(deepEqual({
            paymentMethodName: ApplePayPaymentMethodName,
            status: PaymentStatus.SUCCESS,
            data: response,
          }))).once();
          verify(subscriberMock.error(anything())).never();
          verify(subscriberMock.complete()).once();
          done();
        });
    });

    it('publishes FAILURE result to subscriber when response errorcode != 0', done => {
      const responseWithErrorCode = {
        ...response,
        errorcode: '123',
        errormessage: 'failed',
      };

      applePayResponseHandlerService
        .handlePaymentResponse(of(responseWithErrorCode), instance(subscriberMock))
        .subscribe(() => {
          verify(subscriberMock.next(deepEqual({
            status: PaymentStatus.FAILURE,
            paymentMethodName: ApplePayPaymentMethodName,
            data: responseWithErrorCode,
            error: {
              code: 123,
              message: 'failed',
            },
          }))).once();
          verify(subscriberMock.complete()).once();
          done();
      });
    });
      
    it('publishes ERROR result if response observable returns an error', done => {
      const responseError = new Error('error');

      applePayResponseHandlerService
        .handlePaymentResponse(throwError(() => responseError), instance(subscriberMock))
        .subscribe({
          error: (error) => {
            verify(subscriberMock.error(deepEqual({
              status: PaymentStatus.ERROR,
              data: responseError,
              error: {
                code: 50003,
                message: 'error',
              },
            }))).once();
            expect(error).toBe(responseError);
            done();
          },
        });
    });
  });
});
