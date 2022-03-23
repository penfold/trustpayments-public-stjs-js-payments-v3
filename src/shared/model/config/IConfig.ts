import { ConfigInterface } from '@trustpayments/3ds-sdk-js';
import { IPlaceholdersConfig } from '../../../application/core/models/IPlaceholdersConfig';
import { IVisaCheckoutConfig } from '../../../application/core/integrations/visa-checkout/IVisaCheckoutConfig';
import { GooglePayConfigName, IGooglePayConfig } from '../../../integrations/google-pay/models/IGooglePayConfig';
import { IApplePayConfig } from '../../../integrations/apple-pay/client/models/IApplePayConfig';
import { TokenizedCardPaymentConfigName } from '../../../integrations/tokenized-card/models/ITokenizedCardPaymentMethod';
import { ITokenizedCardPaymentConfig } from '../../../integrations/tokenized-card/models/ITokenizedCardPayment';
import { IBypassInit } from './IBypassInit';
import { IComponentsConfig } from './IComponentsConfig';
import { IComponentsIds } from './IComponentsIds';
import { IStyles } from './IStyles';

export interface IConfig {
  analytics?: boolean;
  animatedCard?: boolean;
  applePay?: IApplePayConfig;
  buttonId?: string;
  cancelCallback?: (...args: unknown[]) => unknown | null;
  componentIds?: IComponentsIds;
  components?: IComponentsConfig;
  cybertonicaApiKey?: string;
  datacenterurl?: string;
  deferInit?: boolean;
  disableNotification?: boolean;
  errorCallback?: (...args: unknown[]) => unknown | null;
  errorReporting?: boolean;
  fieldsToSubmit?: string[];
  formId?: string;
  [GooglePayConfigName]?: IGooglePayConfig;
  init?: IBypassInit;
  jwt?: string;
  livestatus?: 0 | 1;
  origin?: string;
  panIcon?: boolean;
  placeholders?: IPlaceholdersConfig;
  stopSubmitFormOnEnter?: boolean;
  styles?: IStyles;
  submitCallback?: (...args: unknown[]) => unknown | null;
  submitFields?: string[];
  submitOnCancel?: boolean;
  submitOnError?: boolean;
  submitOnSuccess?: boolean;
  successCallback?: (...args: unknown[]) => unknown | null;
  translations?: Record<string, unknown>;
  visaCheckout?: IVisaCheckoutConfig;
  threeDSecure?: ConfigInterface;
  [TokenizedCardPaymentConfigName]?: ITokenizedCardPaymentConfig,
}
