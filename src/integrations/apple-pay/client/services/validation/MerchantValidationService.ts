import { Service } from 'typedi';
import { GoogleAnalytics } from '../../../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { PUBLIC_EVENTS } from '../../../../../application/core/models/constants/EventTypes';
import { CONTROL_FRAME_IFRAME } from '../../../../../application/core/models/constants/Selectors';
import { IMessageBusEvent } from '../../../../../application/core/models/IMessageBusEvent';
import { IFrameQueryingService } from '../../../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { IApplePayValidateMerchantRequest } from '../../models/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IApplePayWalletVerifyResponseBody } from '../../models/apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';
import { ApplePayClientStatus } from '../../models/ApplePayClientStatus';
import { IApplePaySession } from '../../models/IApplePaySession';
import { IApplePayValidateMerchantEvent } from '../../models/IApplePayValidateMerchantEvent';
import { IApplePayConfigObject } from '../config/IApplePayConfigObject';

@Service()
export class MerchantValidationService {
  constructor(
    private frameQueryingService: IFrameQueryingService,
    private googleAnalytics: GoogleAnalytics,
  ) {
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
            this.googleAnalytics.sendGaData(
              'event',
              'Apple Pay',
              `${ApplePayClientStatus.ON_VALIDATE_MERCHANT}`,
              'Apple Pay Merchant validation success',
            );
            this.googleAnalytics.sendGaData('event', 'Apple Pay', 'walletverify', 'Apple Pay walletverify success');
          } else {
            applePaySession.abort();
            this.googleAnalytics.sendGaData(
              'event',
              'Apple Pay',
              `${ApplePayClientStatus.ON_VALIDATE_MERCHANT}`,
              'Apple Pay Merchant validation error',
            );
            this.googleAnalytics.sendGaData('event', 'Apple Pay', 'walletverify', 'Apple Pay walletverify failure');
          }
        },
        error: () => {
          applePaySession.abort();
          this.googleAnalytics.sendGaData(
            'event',
            'Apple Pay',
            `${ApplePayClientStatus.ON_VALIDATE_MERCHANT}`,
            'Apple Pay Merchant validation error',
          );
          this.googleAnalytics.sendGaData('event', 'Apple Pay', 'walletverify', 'Apple Pay walletverify failure');
        },
      });
    };
  }
}
