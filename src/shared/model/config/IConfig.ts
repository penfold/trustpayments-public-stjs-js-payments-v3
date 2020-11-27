import { IBypassInit } from './IBypassInit';
import { IComponentsConfig } from './IComponentsConfig';
import { IComponentsIds } from './IComponentsIds';
import { IStyles } from './IStyles';
import { IPlaceholdersConfig } from '../../../application/core/models/IPlaceholdersConfig';
import { IVisaCheckoutConfig } from '../../../application/core/integrations/visa-checkout/IVisaCheckoutConfig';
import { IApplePayConfig } from '../../../application/core/models/IApplePayConfig';

export interface IConfig {
  analytics?: boolean;
  animatedCard?: boolean;
  applePay?: IApplePayConfig | {};
  buttonId?: string;
  cancelCallback?: any;
  components?: IComponentsConfig;
  componentIds?: IComponentsIds;
  cybertonicaApiKey?: string;
  datacenterurl?: string;
  deferInit?: boolean;
  disableNotification?: boolean;
  errorCallback?: any;
  errorReporting?: boolean;
  fieldsToSubmit?: string[];
  formId?: string;
  init?: IBypassInit;
  jwt: string;
  livestatus?: 0 | 1;
  origin?: string;
  panIcon?: boolean;
  placeholders?: IPlaceholdersConfig;
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
