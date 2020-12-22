import { Service } from 'typedi';
import { from, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { IApplePayProcessPaymentResponse } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayProcessPaymentResponse';
import { IApplePayWalletVerifyResponse } from '../../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayWalletVerifyResponse';
import { IApplePayValidateMerchantRequest } from '../../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { RequestType } from '../../../../shared/types/RequestType';
import { ApplePayConfigService } from '../../../../application/core/integrations/apple-pay/apple-pay-config-service/ApplePayConfigService';
import { ApplePayClientErrorCode } from '../ApplePayClientErrorCode';
import { Payment } from '../../../../application/core/shared/payment/Payment';
import { IApplePayClientStatusDetails } from '../IApplePayClientStatusDetails';
import { ApplePayClientErrorService } from '../apple-pay-client-error-service/ApplePayClientErrorService';
import { IApplePayPayment } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPayment';

@Service()
export class ApplePayPaymentService {
  constructor(
    private payment: Payment,
    private applePayConfigService: ApplePayConfigService,
    private applePayClientErrorService: ApplePayClientErrorService
  ) {}

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
  ): Observable<any> {
    const wallettoken = JSON.stringify(payment);
    return from(
      this.payment.processPayment(
        requestTypes,
        {
          walletsource: validateMerchantRequest.walletsource,
          wallettoken
        },
        {
          ...formData,
          termurl: 'https://termurl.com'
        }
        // {
        //   billingContact: payment.billingContact,
        //   shippingContact: payment.shippingContact
        // }
      )
    ).pipe(
      switchMap((data: any) => {
        console.error(data);
        return of({ data });
      })
    );

    //   .pipe(
    //   tap(console.error),
    //   switchMap((response: IApplePayProcessPaymentResponse) => {
    //     console.error(response);
    //     return of({
    //       errorCode: this.applePayClientErrorService.create(response.response.errorcode),
    //       errorMessage: response.response.errormessage
    //     });
    //   }),
    //   catchError((error: any) => {
    //     console.error(error);
    //     return of({
    //       errorCode: this.applePayClientErrorService.create('1'),
    //       errorMessage: error
    //     });
    //   })
    // );
  }
}
