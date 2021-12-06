import { ValidationErrorItem, ValidationResult } from 'joi';
import { ContainerInstance, Service } from 'typedi';
import { ConfigInterface } from '@trustpayments/3ds-sdk-js';
import {
  threeDSecureConfigName,
} from '../../../application/core/services/three-d-verification/implementations/trust-payments/IThreeDSecure';
import { IConfig } from '../../model/config/IConfig';
import { IComponentsIds } from '../../model/config/IComponentsIds';
import { IComponentsConfig } from '../../model/config/IComponentsConfig';
import { DefaultSubmitFields } from '../../../application/core/models/constants/config-resolver/DefaultSubmitFields';
import { DefaultComponentsIds } from '../../../application/core/models/constants/config-resolver/DefaultComponentsIds';
import { DefaultConfig } from '../../../application/core/models/constants/config-resolver/DefaultConfig';
import { DefaultComponents } from '../../../application/core/models/constants/config-resolver/DefaultComponents';
import { IVisaCheckoutConfig } from '../../../application/core/integrations/visa-checkout/IVisaCheckoutConfig';
import { IPlaceholdersConfig } from '../../../application/core/models/IPlaceholdersConfig';
import { DefaultPlaceholders } from '../../../application/core/models/constants/config-resolver/DefaultPlaceholders';
import { environment } from '../../../environments/environment';
import { IGooglePayConfig } from '../../../integrations/google-pay/models/IGooglePayConfig';
import { ConfigValidator } from '../config-validator/ConfigValidator';
import { SentryService } from '../sentry/SentryService';
import { MisconfigurationError } from '../sentry/MisconfigurationError';
import { IApplePayConfig } from '../../../integrations/apple-pay/client/models/IApplePayConfig';

@Service()
export class ConfigResolver {
  constructor(
    private configValidator: ConfigValidator,
    private container: ContainerInstance,
  ) {
  }

  resolve(config: IConfig): IConfig {
    this.validate(config);
    const validatedConfig: IConfig = {
      analytics: this.getValueOrDefault(config.analytics, DefaultConfig.analytics),
      animatedCard: this.getValueOrDefault(config.animatedCard, DefaultConfig.animatedCard),
      applePay: this.setApplePayConfig(config.applePay),
      buttonId: this.getValueOrDefault(config.buttonId, DefaultConfig.buttonId),
      stopSubmitFormOnEnter: this.getValueOrDefault(config.stopSubmitFormOnEnter, DefaultConfig.stopSubmitFormOnEnter),
      cancelCallback: this.getValueOrDefault(config.cancelCallback, DefaultConfig.cancelCallback),
      componentIds: this.setComponentIds(config.componentIds),
      components: this.setComponentsProperties(config.components),
      cybertonicaApiKey: this.resolveCybertonicaApiKey(config.cybertonicaApiKey),
      datacenterurl: this.getValueOrDefault(config.datacenterurl, DefaultConfig.datacenterurl),
      deferInit: this.getValueOrDefault(config.deferInit, DefaultConfig.deferInit),
      disableNotification: this.getValueOrDefault(config.disableNotification, DefaultConfig.disableNotification),
      errorCallback: this.getValueOrDefault(config.errorCallback, DefaultConfig.errorCallback),
      errorReporting: this.getValueOrDefault(config.errorReporting, DefaultConfig.errorReporting),
      fieldsToSubmit: this.getValueOrDefault(config.fieldsToSubmit, DefaultConfig.fieldsToSubmit),
      formId: this.getValueOrDefault(config.formId, DefaultConfig.formId),
      googlePay: this.setGooglePayConfig(config.googlePay),
      init: this.getValueOrDefault(config.init, DefaultConfig.init),
      jwt: this.getValueOrDefault(config.jwt, DefaultConfig.jwt),
      livestatus: this.getValueOrDefault(config.livestatus, DefaultConfig.livestatus),
      origin: this.getValueOrDefault(config.origin, DefaultConfig.origin),
      panIcon: this.getValueOrDefault(config.panIcon, DefaultConfig.panIcon),
      placeholders: this.setPlaceholders(config.placeholders),
      styles: this.getValueOrDefault(config.styles, DefaultConfig.styles),
      submitCallback: this.getValueOrDefault(config.submitCallback, DefaultConfig.submitCallback),
      submitFields: this.getValueOrDefault(config.submitFields, DefaultSubmitFields),
      submitOnCancel: this.getValueOrDefault(config.submitOnCancel, false),
      submitOnError: this.getValueOrDefault(config.submitOnError, DefaultConfig.submitOnError),
      submitOnSuccess: this.getValueOrDefault(config.submitOnSuccess, DefaultConfig.submitOnSuccess),
      successCallback: this.getValueOrDefault(config.successCallback, DefaultConfig.successCallback),
      translations: this.getValueOrDefault(config.translations, DefaultConfig.translations),
      visaCheckout: this.setVisaCheckoutConfig(config.visaCheckout),
      [threeDSecureConfigName]: this.setThreeDSecureConfig(config[threeDSecureConfigName]),
    };
    if (!environment.production) {
      console.error(validatedConfig);
    }
    return validatedConfig;
  }

  private validate(config: IConfig): void {
    const validationResult: ValidationResult = this.configValidator.validate(config);

    if (validationResult.error) {
      this.container.get(SentryService).sendCustomMessage(new MisconfigurationError(`Misconfiguration: ${validationResult.error.message}`, validationResult.error));
      throw validationResult.error;
    }

    if (validationResult.warning) {
      validationResult.warning.details.forEach((item: ValidationErrorItem) => {
        console.warn(item.message);
        this.handleValidationExceptions(item);
      });
    }
  }

  private getValueOrDefault<T>(value: T | undefined, defaultValue: T): T {
    switch (typeof value) {
      case 'undefined':
        return defaultValue;
      case 'string':
        return value.length ? value : defaultValue;
      case 'number':
        return Number.isFinite(value) ? value : defaultValue;
      case 'boolean':
        return value;
      case 'object':
        if (value === null) {
          return defaultValue;
        }
        if (Array.isArray(value)) {
          return value.length ? value : defaultValue;
        }
        return Object.keys(value).length ? value : defaultValue;
      default:
        return value ? value : defaultValue;
    }
  }

  private setVisaCheckoutConfig(config: IVisaCheckoutConfig): IVisaCheckoutConfig {
    if (!config || !Object.keys(config).length) {
      return;
    }
    return config;
  }

  private setApplePayConfig(config: IApplePayConfig): IApplePayConfig {
    if (!config || !Object.keys(config).length) {
      return;
    }
    return config;
  }

  private setGooglePayConfig(config: IGooglePayConfig): IGooglePayConfig {
    if (!config || !Object.keys(config).length) {
      return;
    }
    return config;
  }

  private setThreeDSecureConfig(config: ConfigInterface): ConfigInterface {
    if (!config) {
      return DefaultConfig.threeDSecure;
    }

    return {
      ...config,
      loggingLevel: this.getValueOrDefault(config.loggingLevel, DefaultConfig.threeDSecure.loggingLevel),
      challengeDisplayMode: this.getValueOrDefault(config.challengeDisplayMode, DefaultConfig.threeDSecure.challengeDisplayMode),
      translations: this.getValueOrDefault(config.translations, DefaultConfig.threeDSecure.translations),
      processingScreenMode: this.getValueOrDefault(config.processingScreenMode, DefaultConfig.threeDSecure.processingScreenMode),
    };
  }

  private setComponentIds(config: IComponentsIds): IComponentsIds {
    if (!config || !Object.keys(config).length) {
      return DefaultComponentsIds;
    }
    return {
      animatedCard: this.getValueOrDefault(config.animatedCard, DefaultComponentsIds.animatedCard),
      cardNumber: this.getValueOrDefault(config.cardNumber, DefaultComponentsIds.cardNumber),
      expirationDate: this.getValueOrDefault(config.expirationDate, DefaultComponentsIds.expirationDate),
      notificationFrame: this.getValueOrDefault(config.notificationFrame, DefaultComponentsIds.notificationFrame),
      securityCode: this.getValueOrDefault(config.securityCode, DefaultComponentsIds.securityCode),
    };
  }

  private setComponentsProperties(config: IComponentsConfig): IComponentsConfig {
    if (!config || !Object.keys(config).length) {
      return DefaultComponents;
    }
    return {
      defaultPaymentType: this.getValueOrDefault(config.defaultPaymentType, DefaultComponents.defaultPaymentType),
      paymentTypes: this.getValueOrDefault(config.paymentTypes, DefaultComponents.paymentTypes),
      startOnLoad: this.getValueOrDefault(config.startOnLoad, DefaultComponents.startOnLoad),
    };
  }

  private setPlaceholders(config: IPlaceholdersConfig): IPlaceholdersConfig {
    if (!config || !Object.keys(config).length) {
      return DefaultPlaceholders;
    }
    return {
      pan: this.getValueOrDefault(config.pan, DefaultPlaceholders.pan),
      expirydate: this.getValueOrDefault(config.expirydate, DefaultPlaceholders.expirydate),
      securitycode: this.getValueOrDefault(config.securitycode, DefaultPlaceholders.securitycode),
    };
  }

  private resolveCybertonicaApiKey(value: string): string {
    if (value === '') {
      return '';
    }

    return this.getValueOrDefault(value, DefaultConfig.cybertonicaApiKey);
  }

  private handleValidationExceptions(item: ValidationErrorItem): void {
    if(item?.path?.toString() === 'datacenterurl') {
      this.container.get(SentryService).sendCustomMessage(new Error(`Invalid ${item?.context?.key} config value: ${item?.context?.value}`));
    }
    if(item?.type === 'deprecate.error') {
      this.container.get(SentryService).sendCustomMessage(new MisconfigurationError(`Misconfiguration: ${item?.message}`));
    }
  }
}
