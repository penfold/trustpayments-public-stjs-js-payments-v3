import { Service } from 'typedi';
import { from, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { IApplePayPaymentAuthorizedEvent } from '../apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';
import { IApplePayProcessPaymentResponse } from '../apple-pay-payment-data/IApplePayProcessPaymentResponse';
import { IApplePaySession } from '../apple-pay-session-service/IApplePaySession';
import { IApplePayWalletVerifyResponse } from '../apple-pay-walletverify-data/IApplePayWalletVerifyResponse';
import { IApplePayValidateMerchantRequest } from '../apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { PAYMENT_ERROR } from '../../../models/constants/Translations';
import { RequestType } from '../../../../../shared/types/RequestType';
import { ApplePayConfigService } from '../apple-pay-config-service/ApplePayConfigService';
import { ApplePayClientErrorCode } from '../../../../../client/integrations/apple-pay/ApplePayClientErrorCode';
import { DomMethods } from '../../../shared/dom-methods/DomMethods';
import { Payment } from '../../../shared/payment/Payment';

@Service()
export class ApplePayPaymentService {
  private payment: Payment;

  constructor(private applePayConfigService: ApplePayConfigService) {
    this.payment = new Payment();
  }

  walletVerify(
    validateMerchantRequest: IApplePayValidateMerchantRequest,
    validationURL: string,
    cancelled: boolean,
    applePaySession: IApplePaySession
  ): Observable<ApplePayClientErrorCode> {
    const request: IApplePayValidateMerchantRequest = this.applePayConfigService.updateWalletValidationUrl(
      validateMerchantRequest,
      validationURL
    );

    return this.payment.walletVerify(request).pipe(
      tap(() => {
        if (cancelled) {
          return of(ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR);
        }
      }),
      switchMap((response: IApplePayWalletVerifyResponse) => {
        const { walletsession } = response.response;

        if (!walletsession) {
          return of(ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR);
        }
        applePaySession.completeMerchantValidation(JSON.parse(walletsession));
        return of(ApplePayClientErrorCode.VALIDATE_MERCHANT_SUCCESS);
      }),
      catchError(() => {
        return of(ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR);
      })
    );
  }

  processPayment(
    requestTypes: RequestType[],
    validateMerchantRequest: IApplePayValidateMerchantRequest,
    formId: string,
    event: IApplePayPaymentAuthorizedEvent
  ): Observable<{ errorCode: string; errorMessage: string }> {
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
          errorCode: response.response.errorcode,
          errorMessage: response.response.errormessage
        });
      }),
      catchError(() => {
        return of({
          errorCode: '1',
          errorMessage: PAYMENT_ERROR
        });
      })
    );
  }
}
