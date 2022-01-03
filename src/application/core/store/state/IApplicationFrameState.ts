import { IConfig } from '../../../../shared/model/config/IConfig';
import { IAPMConfig } from '../../../../integrations/apm/models/IAPMConfig';
import { IComponentsConfig } from '../../../../shared/model/config/IComponentsConfig';
import { IApplePayConfig } from '../../../../integrations/apple-pay/client/models/IApplePayConfig';
import { IGooglePayConfig } from '../../../../integrations/google-pay/models/IGooglePayConfig';
import { IVisaCheckoutConfig } from '../../integrations/visa-checkout/IVisaCheckoutConfig';
import { APMPaymentMethodName } from '../../../../integrations/apm/models/IAPMPaymentMethod';
import { ApplePayPaymentMethodName } from '../../../../integrations/apple-pay/models/IApplePayPaymentMethod';
import { GooglePaymentMethodName } from '../../../../integrations/google-pay/models/IGooglePaymentMethod';

export interface IApplicationFrameState {
  config?: IConfig;
  storage: { [key: string]: unknown };
  applePay?: { [key: string]: unknown };
  jwt?: string;
  originalJwt?: string;
  initialConfig?: {
    [APMPaymentMethodName]?: IAPMConfig,
    [ApplePayPaymentMethodName]?: IApplePayConfig,
    components?: IComponentsConfig,
    config?: IConfig,
    [GooglePaymentMethodName]?: IGooglePayConfig,
    VisaCheckout?: IVisaCheckoutConfig
  }
}
