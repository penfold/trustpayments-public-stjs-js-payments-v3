import { Service } from 'typedi';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

@Service()
export class ApplePayPaymentService {
  constructor(private payment: Payment, private applePayConfigService: ApplePayConfigService) {}

  walletVerify(
    validateMerchantRequest: IApplePayValidateMerchantRequest,
    validationURL: string,
    cancelled: boolean
  ): Observable<any> {
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

    return this.payment.walletVerify(request).pipe(
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
      }),
      catchError(() => {
        return of({
          status: ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR,
          data: {}
        });
      })
    );
  }

  processPayment(
    requestTypes: RequestType[],
    validateMerchantRequest: IApplePayValidateMerchantRequest,
    formData: object,
    payment: IApplePayPayment
  ): Observable<IApplePayProcessPaymentResponse> {
    console.error(requestTypes, validateMerchantRequest, formData, payment);
    return from(
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
        return data.response;
      })
    );
  }
}
