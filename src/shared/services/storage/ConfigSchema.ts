import Joi from 'joi';
import { GooglePayConfigName } from '../../../integrations/google-pay/models/IGooglePayConfig';
import { threeDSecureConfigName } from '../../../application/core/services/three-d-verification/implementations/trust-payments/IThreeDSecure';
import { ApplePaySchema } from './apple-pay-schema/ApplePaySchema';
import { GooglePaySchema } from './google-pay-schema/GooglePaySchema';
import { VisaCheckoutSchema } from './VisaCheckoutSchema';

export const ConfigSchema: Joi.ObjectSchema = Joi.object().keys({
  analytics: Joi.boolean(),
  animatedCard: Joi.boolean(),
  applePay: ApplePaySchema,
  buttonId: Joi.string().allow(''),
  stopSubmitFormOnEnter: Joi.boolean(),
  cancelCallback: Joi.any(),
  clickToPay: Joi.object().keys({
    buttonPlacement: Joi.string(),
  }),
  componentIds: Joi.object()
    .keys({
      animatedCard: Joi.string().allow('').default('st-animated-card'),
      cardNumber: Joi.string().allow('').default('st-card-number'),
      expirationDate: Joi.string().allow('').default('st-expiration-date'),
      notificationFrame: Joi.string().allow('').default('st-notification-frame'),
      securityCode: Joi.string().allow('').default('st-security-code'),
    })
    .allow({})
    .default({}),
  components: Joi.object()
    .keys({
      defaultPaymentType: Joi.string().allow(''),
      paymentTypes: Joi.array().items(Joi.string().allow('')),
      startOnLoad: Joi.boolean().allow(''),
    })
    .default({}),
  cybertonicaApiKey: Joi.string().allow(''),
  datacenterurl: Joi.string()
    .allow('', 'https://webservices.securetrading.us', 'https://webservices.securetrading.net', 'https://webservices.securetrading.us/jwt/', 'https://webservices.securetrading.net/jwt/')
    .warning('deprecate.error', { reason: 'wrong value has been provided' })
    .messages({ 'deprecate.error': '{#label} is incorrect because {#reason}. Please use https://webservices.securetrading.us/jwt/ or https://webservices.securetrading.net/jwt/' }),
  deferInit: Joi.boolean(),
  disableNotification: Joi.boolean().default(false),
  errorCallback: Joi.any(),
  errorReporting: Joi.boolean(),
  fieldsToSubmit: Joi.array().items(Joi.string().valid('pan', 'expirydate', 'securitycode')),
  [GooglePayConfigName]: GooglePaySchema,
  formId: Joi.string(),
  init: Joi.object({
    cachetoken: Joi.string()
      .allow('')
      .warning('deprecate.error', { reason: 'it is no longer supported' })
      .messages({ 'deprecate.error': '{#label} is deprecated because {#reason}' }),
    threedinit: Joi.string()
      .allow('')
      .warning('deprecate.error', { reason: 'it is no longer supported' })
      .messages({ 'deprecate.error': '{#label} is deprecated because {#reason}' }),
  }),
  jwt: Joi.string().allow(''),
  livestatus: Joi.number().valid(0, 1),
  origin: Joi.string().allow(''),
  panIcon: Joi.boolean(),
  placeholders: Joi.object().keys({
    pan: Joi.string().allow(''),
    securitycode: Joi.string().allow(''),
    expirydate: Joi.string().allow(''),
  }),
  styles: Joi.object(),
  submitCallback: Joi.any(),
  successCallback: Joi.any(),
  submitFields: Joi.array(),
  submitOnCancel: Joi.boolean(),
  submitOnError: Joi.boolean(),
  submitOnSuccess: Joi.boolean(),
  translations: Joi.object(),
  visaCheckout: VisaCheckoutSchema,
  [threeDSecureConfigName]: Joi.object().allow({}).keys({
    loggingLevel: Joi.string().valid('ERROR', 'ALL').default('ALL'),
    challengeDisplayMode: Joi.string().valid('POPUP', 'INLINE').default('POPUP'),
    challengeDisplayInlineTargetElementId: Joi.any(),
    translations: Joi.object().allow({}).keys({
      cancel: Joi.string(),
    }),
    processingScreenMode: Joi.string().valid('OVERLAY', 'ATTACH_TO_ELEMENT').default('OVERLAY'),
    processingScreenWrapperElementId: Joi.any(),
    threeDSMethodTimeout: Joi.number().min(1).max(10000).default(10000),
  }),
});
