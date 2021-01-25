import { Service } from 'typedi';
import { EMPTY, from, merge, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, tap, switchMap, first } from 'rxjs/operators';
import { IApplePayPayment } from '../apple-pay-payment-data/IApplePayPayment';
import { IApplePayWalletVerifyResponse } from '../apple-pay-walletverify-data/IApplePayWalletVerifyResponse';
import { IApplePayValidateMerchantRequest } from '../apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { RequestType } from '../../../../../shared/types/RequestType';
import { ApplePayConfigService } from '../apple-pay-config-service/ApplePayConfigService';
import { ApplePayClientErrorCode } from '../ApplePayClientErrorCode';
import { Payment } from '../../../shared/payment/Payment';
import { IApplePayProcessPaymentData } from './IApplePayProcessPaymentData';
import { IApplePayProcessPaymentResponse } from './IApplePayProcessPaymentResponse';
import { TERM_URL } from '../../../models/constants/RequestData';
import { IMessageBus } from '../../../shared/message-bus/IMessageBus';
import { ofType } from '../../../../../shared/services/message-bus/operators/ofType';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { ApplePayClientStatus } from '../ApplePayClientStatus';

@Service()
export class ApplePayPaymentService {
  constructor(
    private payment: Payment,
    private applePayConfigService: ApplePayConfigService,
    private messageBus: IMessageBus
  ) {}

  walletVerify(
    validateMerchantRequest: IApplePayValidateMerchantRequest,
    validationURL: string,
    cancelled: boolean
  ): Observable<{ status: ApplePayClientErrorCode; data: {} }> {
    const request: IApplePayValidateMerchantRequest = this.applePayConfigService.updateWalletValidationUrl(
      validateMerchantRequest,
      validationURL
    );

    if (cancelled) {
      return of({
        status: ApplePayClientErrorCode.CANCEL,
        data: {}
      });
    }

    const walletVerifyError$ = this.messageBus.pipe(
      ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE),
      filter((event: IMessageBusEvent) => Number(event.data.errorcode) !== 0),
      map((event: IMessageBusEvent) => {
        return {
          status: ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR,
          data: {
            errorcode: event.data.errorcode,
            errormessage: event.data.errormessage
          }
        };
      })
    );

    const walletVerify$ = this.payment.walletVerify(request).pipe(
      map((response: IApplePayWalletVerifyResponse) => {
        if (!response.response.walletsession) {
          return {
            status: ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR,
            data: {}
          };
        }
        return {
          status: ApplePayClientErrorCode.VALIDATE_MERCHANT_SUCCESS,
          data: response.response
        };
      })
    );

    return merge(walletVerify$, walletVerifyError$).pipe(first());
  }

  processPayment(
    requestTypes: RequestType[],
    validateMerchantRequest: IApplePayValidateMerchantRequest,
    formData: object,
    payment: IApplePayPayment
  ): Observable<IApplePayProcessPaymentResponse> {
    const bypassError$ = this.messageBus.pipe(
      ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE),
      filter((event: IMessageBusEvent) => {
        if (Number(event.data.errorcode) === 22000 || Number(event.data.errorcode) === 50003) {
          return event.data;
        }
      }),
      map((event: { data: IApplePayProcessPaymentResponse }) => {
        return event.data;
      })
    );

    const processPayment$ = from(
      this.payment.processPayment(
        requestTypes,
        {
          walletsource: validateMerchantRequest.walletsource,
          wallettoken: JSON.stringify(payment)
        },
        {
          ...formData,
          termurl: TERM_URL
        },
        {
          billingContact: payment.billingContact,
          shippingContact: payment.shippingContact
        }
      )
    ).pipe(
      map((data: IApplePayProcessPaymentData) => {
        if (!data.response.errorcode) {
          return {
            ...data.response,
            errormessage: 'An error occured',
            errorcode: ApplePayClientErrorCode.EMPTY_JWT_ERROR
          };
        }
        return data.response;
      })
    );

    return merge(processPayment$, bypassError$).pipe(first());
  }
}
