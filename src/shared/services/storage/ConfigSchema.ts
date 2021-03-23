import Joi from 'joi';
import { IGooglePayConfigName } from '../../../integrations/google-pay/models/IGooglePayConfig';
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
  componentIds: Joi.object()
    .keys({
      animatedCard: Joi.string().allow('').default('st-animated-card'),
      cardNumber: Joi.string().allow('').default('st-card-number'),
      expirationDate: Joi.string().allow('').default('st-expiration-date'),
      notificationFrame: Joi.string().allow('').default('st-notification-frame'),
      securityCode: Joi.string().allow('').default('st-security-code')
    })
    .allow({})
    .default({}),
  components: Joi.object()
    .keys({
      defaultPaymentType: Joi.string().allow(''),
      paymentTypes: Joi.array().items(Joi.string().allow('')),
      startOnLoad: Joi.boolean().allow('')
    })
    .default({}),
  cybertonicaApiKey: Joi.string().allow(''),
  datacenterurl: Joi.string().allow(''),
  deferInit: Joi.boolean(),
  disableNotification: Joi.boolean().default(false),
  errorCallback: Joi.any(),
  errorReporting: Joi.boolean(),
  fieldsToSubmit: Joi.array().items(Joi.string().valid('pan', 'expirydate', 'securitycode')),
  [IGooglePayConfigName]: GooglePaySchema,
  formId: Joi.string(),
  init: Joi.object()
    .keys({
      cachetoken: Joi.string().allow(''),
      threedinit: Joi.string().allow('')
    })
    .allow(null),
  jwt: Joi.string().allow(''),
  livestatus: Joi.number().valid(0, 1),
  origin: Joi.string().allow(''),
  panIcon: Joi.boolean(),
  placeholders: Joi.object().keys({
    pan: Joi.string().allow(''),
    securitycode: Joi.string().allow(''),
    expirydate: Joi.string().allow('')
  }),
  styles: Joi.object(),
  submitCallback: Joi.any(),
  successCallback: Joi.any(),
  submitFields: Joi.array(),
  submitOnCancel: Joi.boolean(),
  submitOnError: Joi.boolean(),
  submitOnSuccess: Joi.boolean(),
  translations: Joi.object(),
  visaCheckout: VisaCheckoutSchema
});
