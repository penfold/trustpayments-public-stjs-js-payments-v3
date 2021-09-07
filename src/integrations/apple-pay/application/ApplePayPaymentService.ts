import { Inject, Service } from 'typedi';
import { from, merge, Observable, of, filter, map, first } from 'rxjs';
import { ApplePayConfigService } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/ApplePayConfigService';
import { IApplePayProcessPaymentResponse } from '../../../application/core/integrations/apple-pay/apple-pay-payment-service/IApplePayProcessPaymentResponse';
import { IApplePayValidateMerchantRequest } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IApplePayWalletVerifyResponse } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayWalletVerifyResponse';
import { IApplePayWalletVerifyResponseBody } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';
import { ApplePayClientErrorCode } from '../../../application/core/integrations/apple-pay/ApplePayClientErrorCode';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IWalletVerify } from '../../../application/core/models/IWalletVerify';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IGatewayClient } from '../../../application/core/services/gateway-client/IGatewayClient';
import { TransportServiceGatewayClient } from '../../../application/core/services/gateway-client/TransportServiceGatewayClient';

@Service()
export class ApplePayPaymentService {
  constructor(
    private applePayConfigService: ApplePayConfigService,
    private messageBus: IMessageBus,
    @Inject(() => TransportServiceGatewayClient) private gatewayClient: IGatewayClient,
  ) {}

  walletVerify(
    validateMerchantRequest: IApplePayValidateMerchantRequest,
    validationURL: string,
    cancelled: boolean
  ): Observable<{ status: ApplePayClientErrorCode; data: Partial<IApplePayWalletVerifyResponseBody> }> {
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
      filter((event: IMessageBusEvent<IApplePayProcessPaymentResponse>) => Number(event.data.errorcode) !== 0),
      map((event: IMessageBusEvent<IApplePayProcessPaymentResponse>) => ({
        status: ApplePayClientErrorCode.VALIDATE_MERCHANT_ERROR,
        data: {
          errorcode: event.data.errorcode,
          errormessage: event.data.errormessage
        }
      }))
    );

    const walletVerify$ = this.walletVerifyRequest(request).pipe(
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

  // 3. handle the query - send request to the gateway
  walletVerifyRequest(walletVerify: IWalletVerify): Observable<Record<string, any>> {
    return from(
      this.gatewayClient.sendRequest(Object.assign({ requesttypedescriptions: ['WALLETVERIFY'] }, walletVerify))
    );
  }
}
