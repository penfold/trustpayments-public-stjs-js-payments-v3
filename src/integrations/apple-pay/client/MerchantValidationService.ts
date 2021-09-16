import { Service } from 'typedi';
import { IApplePaySession } from '../../../client/integrations/apple-pay/apple-pay-session-service/IApplePaySession';
import { IApplePayValidateMerchantEvent } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantEvent';
import { IApplePayConfigObject } from '../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IApplePayValidateMerchantRequest } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { CONTROL_FRAME_IFRAME } from '../../../application/core/models/constants/Selectors';
import { IApplePayWalletVerifyResponseBody } from '../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';
import { IFrameQueryingService } from '../../../shared/services/message-bus/interfaces/IFrameQueryingService';

@Service()
export class MerchantValidationService {
  constructor(private frameQueryingService: IFrameQueryingService) {
  }

  init(applePaySession: IApplePaySession, config: IApplePayConfigObject): void {
    applePaySession.onvalidatemerchant = (event: IApplePayValidateMerchantEvent) => {
      const validateMerchantQueryEvent: IMessageBusEvent<IApplePayValidateMerchantRequest> = {
        type: PUBLIC_EVENTS.APPLE_PAY_VALIDATE_MERCHANT_2,
        data: {
          ...config.validateMerchantRequest,
          walletvalidationurl: event.validationURL,
        },
      };

      this.frameQueryingService.query(validateMerchantQueryEvent, CONTROL_FRAME_IFRAME).subscribe({
        next: (response: IApplePayWalletVerifyResponseBody) => {
          if (Number(response.errorcode) === 0) {
            applePaySession.completeMerchantValidation(JSON.parse(response.walletsession));
          } else {
            applePaySession.abort();
          }
        },
        error: () => {
          applePaySession.abort();
        },
      });
    };
  }
}
