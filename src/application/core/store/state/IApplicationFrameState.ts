import { IConfig } from '../../../../shared/model/config/IConfig';
import { IAPMConfig } from '../../../../integrations/apm/models/IAPMConfig';
import { IComponentsConfig } from '../../../../shared/model/config/IComponentsConfig';
import { IApplePayConfig } from '../../../../integrations/apple-pay/client/models/IApplePayConfig';
import { IGooglePayConfig } from '../../../../integrations/google-pay/models/IGooglePayConfig';
import { IVisaCheckoutConfig } from '../../integrations/visa-checkout/IVisaCheckoutConfig';
import { APMPaymentMethodName } from '../../../../integrations/apm/models/IAPMPaymentMethod';
import { ApplePayPaymentMethodName } from '../../../../integrations/apple-pay/models/IApplePayPaymentMethod';
import { GooglePaymentMethodName } from '../../../../integrations/google-pay/models/IGooglePaymentMethod';
import { TokenizedCardPaymentConfigName } from '../../../../integrations/tokenized-card/models/ITokenizedCardPaymentMethod';
import { ITokenizedCardPaymentConfig } from '../../../../integrations/tokenized-card/models/ITokenizedCardPayment';

export interface IApplicationFrameState {
  config?: IConfig;
  storage: { [key: string]: unknown };
  applePay?: { [key: string]: unknown };
  jwt?: string;
  originalJwt?: string;
  tokenizedJwt?: string;
  initialConfig?: {
    [APMPaymentMethodName]?: IAPMConfig,
    [ApplePayPaymentMethodName]?: IApplePayConfig,
    [TokenizedCardPaymentConfigName]?:ITokenizedCardPaymentConfig;
    components?: IComponentsConfig,
    config?: IConfig,
    [GooglePaymentMethodName]?: IGooglePayConfig,
    VisaCheckout?: IVisaCheckoutConfig
  }
}
