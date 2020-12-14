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
    console.error('Step 1', request);
    return from(this.payment.walletVerify(request)).pipe(
      tap(() => {
        console.error('Step 2', cancelled);
        if (cancelled) {
          return of(ApplePayErrorCodes.VALIDATE_MERCHANT_ERROR);
        }
      }),
      switchMap((response: IApplePayWalletVerifyResponse) => {
        console.error('Step 2', response);
        const { walletsession } = response.response;

        if (!walletsession) {
          return of(ApplePayErrorCodes.VALIDATE_MERCHANT_ERROR);
        }
        applePaySession.completeMerchantValidation(JSON.parse(walletsession));
        return of(ApplePayErrorCodes.VALIDATE_MERCHANT_SUCCESS);
      }),
      catchError((e: any) => {
        console.error(e);
        return of(ApplePayErrorCodes.VALIDATE_MERCHANT_ERROR);
      })
    );
  }
}
