import { IBypassInit } from './IBypassInit';
import { IComponentsConfig } from './IComponentsConfig';
import { IComponentsIds } from './IComponentsIds';
import { IStyles } from './IStyles';
import { IPlaceholdersConfig } from '../../../application/core/models/IPlaceholdersConfig';
import { IVisaCheckoutConfig } from '../../../application/core/integrations/visa-checkout/IVisaCheckoutConfig';
import { IApplePayConfig } from '../../../application/core/integrations/apple-pay/IApplePayConfig';
import { IGooglePayConfig, GooglePayConfigName } from '../../../integrations/google-pay/models/IGooglePayConfig';
import { ConfigInterface } from '@trustpayments/3ds-sdk-js';

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
}
