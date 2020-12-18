import { Service } from 'typedi';
import { from, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { IApplePayPaymentAuthorizedEvent } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';
import { IApplePayProcessPaymentResponse } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayProcessPaymentResponse';
import { IApplePayWalletVerifyResponse } from '../../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayWalletVerifyResponse';
import { IApplePayValidateMerchantRequest } from '../../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { RequestType } from '../../../../shared/types/RequestType';
import { ApplePayConfigService } from '../../../../application/core/integrations/apple-pay/apple-pay-config-service/ApplePayConfigService';
import { ApplePayClientErrorCode } from '../ApplePayClientErrorCode';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { Payment } from '../../../../application/core/shared/payment/Payment';
import { IApplePayClientErrorDetails } from '../IApplePayClientErrorDetails';
import { ApplePayClientErrorService } from '../apple-pay-client-error-service/ApplePayClientErrorService';
import { IApplePayClientStatus } from '../IApplePayClientStatus';

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
          data: response.response.walletsession
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
    formId: string,
    event: IApplePayPaymentAuthorizedEvent
  ): Observable<IApplePayClientErrorDetails> {
    return from(
      this.payment.processPayment(
        requestTypes,
        {
          walletsource: validateMerchantRequest.walletsource,
          wallettoken: JSON.stringify(event.payment)
        },
        {
          ...DomMethods.parseForm(formId),
          termurl: 'https://termurl.com'
        },
        {
          billingContact: event.payment.billingContact,
          shippingContact: event.payment.shippingContact
        }
      )
    ).pipe(
      switchMap((response: IApplePayProcessPaymentResponse) => {
        return of({
          errorCode: this.applePayClientErrorService.create(response.response.errorcode),
          errorMessage: response.response.errormessage
        });
      }),
      catchError((error: any) => {
        return of({
          errorCode: this.applePayClientErrorService.create('1'),
          errorMessage: error
        });
      })
    );
  }
}