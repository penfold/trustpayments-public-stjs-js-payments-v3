import { ApplePayErrorContactField } from './application/core/integrations/apple-pay/apple-pay-error-service/ApplePayErrorContactField';
import { IApplePayError } from './application/core/integrations/apple-pay/apple-pay-error-service/IApplePayError';
import { ApplePaySessionErrorCode } from './application/core/integrations/apple-pay/apple-pay-error-service/ApplePaySessionErrorCode';
import { IApplePaySessionConstructor } from './client/integrations/apple-pay/apple-pay-session-service/IApplePaySessionConstructor';
import { ICardinal } from './client/integrations/cardinal-commerce/ICardinal';
import { IGoogleClient } from './integrations/google-pay/models/IGooglePayClient';
import { ISeon } from './application/core/integrations/seon/ISeon';
import { IAFCybertonica } from './application/core/integrations/cybertonica/IAFCybertonica';

interface IApplePayErrorConstructor {
  new (
    content: ApplePaySessionErrorCode,
    contactField?: ApplePayErrorContactField,
    message?: string
  ): IApplePayError
}

declare global {
  interface Window {
    ApplePayError: IApplePayErrorConstructor | undefined;
    ApplePaySession: IApplePaySessionConstructor | undefined;
    Cardinal: ICardinal | undefined;
    google: IGoogleClient | undefined;
    seon: ISeon | undefined;
    AFCYBERTONICA: IAFCybertonica;
  }
}
