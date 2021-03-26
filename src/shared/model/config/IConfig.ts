import { IBypassInit } from './IBypassInit';
import { IComponentsConfig } from './IComponentsConfig';
import { IComponentsIds } from './IComponentsIds';
import { IStyles } from './IStyles';
import { IPlaceholdersConfig } from '../../../application/core/models/IPlaceholdersConfig';
import { IVisaCheckoutConfig } from '../../../application/core/integrations/visa-checkout/IVisaCheckoutConfig';
import { IApplePayConfig } from '../../../application/core/integrations/apple-pay/IApplePayConfig';
import { IGooglePayConfig } from '../../../application/core/integrations/google-pay/models/IGooglePayConfig';

export interface IConfig {
  analytics?: boolean;
  animatedCard?: boolean;
  applePay?: IApplePayConfig;
  buttonId?: string;
  cancelCallback?: any;
  componentIds?: IComponentsIds;
  components?: IComponentsConfig;
  cybertonicaApiKey?: string;
  datacenterurl?: string;
  deferInit?: boolean;
  disableNotification?: boolean;
  errorCallback?: any;
  errorReporting?: boolean;
  fieldsToSubmit?: string[];
  formId?: string;
  googlePay?: IGooglePayConfig;
  init?: IBypassInit;
  jwt?: string;
  livestatus?: 0 | 1;
  origin?: string;
  panIcon?: boolean;
  placeholders?: IPlaceholdersConfig;
  stopSubmitFormOnEnter?: boolean;
  styles?: IStyles;
  submitCallback?: any;
  submitFields?: string[];
  submitOnCancel?: boolean;
  submitOnError?: boolean;
  submitOnSuccess?: boolean;
  successCallback?: any;
  translations?: {};
  visaCheckout?: IVisaCheckoutConfig;
}
