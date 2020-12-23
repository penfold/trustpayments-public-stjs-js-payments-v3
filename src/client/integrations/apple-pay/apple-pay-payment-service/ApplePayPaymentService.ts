import { Service } from 'typedi';
import { from, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { IApplePayPayment } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPayment';
import { IApplePayWalletVerifyResponse } from '../../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayWalletVerifyResponse';
import { IApplePayValidateMerchantRequest } from '../../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { RequestType } from '../../../../shared/types/RequestType';
import { ApplePayConfigService } from '../../../../application/core/integrations/apple-pay/apple-pay-config-service/ApplePayConfigService';
import { ApplePayClientErrorCode } from '../ApplePayClientErrorCode';
import { Payment } from '../../../../application/core/shared/payment/Payment';
import { IApplePayProcessPaymentData } from './IApplePayProcessPaymentData';
import { IApplePayProcessPaymentResponse } from './IApplePayProcessPaymentResponse';

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
      switchMap((response: IApplePayWalletVerifyResponse) => {
        if (!response.response.walletsession) {
          return of({
            status: ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR,
            data: {}
          });
        }
        return of({
          status: ApplePayClientErrorCode.VALIDATE_MERCHANT_SUCCESS,
          data: response.response
        });
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
    return from(
      this.payment.processPayment(
        requestTypes,
        {
          walletsource: validateMerchantRequest.walletsource,
          wallettoken: JSON.stringify(payment)
        },
        {
          ...formData,
          termurl: 'https://termurl.com'
        },
        {
          billingContact: payment.billingContact,
          shippingContact: payment.shippingContact
        }
      )
    ).pipe(
      switchMap((data: IApplePayProcessPaymentData) => {
        return of(data.response);
      })
    );
  }
}
