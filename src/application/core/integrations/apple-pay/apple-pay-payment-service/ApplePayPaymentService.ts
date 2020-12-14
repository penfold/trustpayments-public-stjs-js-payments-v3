import { Payment } from '../../../shared/payment/Payment';
import { IApplePayValidateMerchantRequest } from '../IApplePayValidateMerchantRequest';
import { ApplePayConfigService } from '../apple-pay-config-service/ApplePayConfigService';
import { IApplePayWalletVerifyResponse } from '../IApplePayWalletVerifyResponse';
import { from, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ApplePayErrorCodes } from '../apple-pay-error-service/ApplePayErrorCodes';
import { IApplePaySession } from '../apple-pay-session-service/IApplePaySession';
import { Service } from 'typedi';

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
  ): Observable<ApplePayErrorCodes> {
    const request: IApplePayValidateMerchantRequest = this.applePayConfigService.updateWalletValidationUrl(
      validateMerchantRequest,
      validationURL
    );

    return from(this.payment.walletVerify(request)).pipe(
      tap(() => {
        if (cancelled) {
          return of(ApplePayErrorCodes.VALIDATE_MERCHANT_ERROR);
        }
      }),
      switchMap((response: IApplePayWalletVerifyResponse) => {
        const { walletsession } = response.response;

        if (!walletsession) {
          return of(ApplePayErrorCodes.VALIDATE_MERCHANT_ERROR);
        }
        applePaySession.completeMerchantValidation(JSON.parse(walletsession));
        return of(ApplePayErrorCodes.VALIDATE_MERCHANT_SUCCESS);
      }),
      catchError(() => {
        return of(ApplePayErrorCodes.VALIDATE_MERCHANT_ERROR);
      })
    );
  }

  processPayment() {}
}
