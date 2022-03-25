import Joi, { ObjectSchema } from 'joi';
import { APMName } from './APMName';

const returnUrlsDeprecationMessage = 'Redirect urls for APMs should be set in JWT and not in APM config';
export const APMSchema: ObjectSchema = Joi.object().keys({
  placement: Joi.string().required(),
  successRedirectUrl: Joi.string()
    .warning('deprecate.error', { reason: returnUrlsDeprecationMessage })
    .messages({ 'deprecate.error': '{#label} is no longer supported in APM config. {#reason}' }),
  errorRedirectUrl: Joi.string()
    .warning('deprecate.error', { reason: returnUrlsDeprecationMessage })
    .messages({ 'deprecate.error': '{#label} is no longer supported in APM config. {#reason}' }),
  cancelRedirectUrl: Joi.string()
    .warning('deprecate.error', { reason: returnUrlsDeprecationMessage })
    .messages({ 'deprecate.error': '{#label} is no longer supported in APM config. {#reason}' }),
  apmList: Joi.array()
    .items(Joi.string().valid(...Object.values(APMName)), Joi.object())
    .required(),
});

const configSchemaFactory = (apmName: APMName) => {
  switch (apmName) {
    case APMName.ACCOUNT2ACCOUNT:
      return Joi.object().keys({
        button: Joi.object().keys({
          width: Joi.string(),
          height: Joi.string(),
          backgroundColor: Joi.string(),
          textColor: Joi.string(),
          text: Joi.string(),
        }),
        name: Joi.string().valid(apmName).required(),
        placement: Joi.string().required(),
        returnUrl: Joi.string()
          .warning('deprecate.error', { reason: returnUrlsDeprecationMessage })
          .messages({ 'deprecate.error': `{#label} is no longer supported in ${apmName} APM config. {#reason}` }),
      }).unknown();
    case APMName.ALIPAY:
      return Joi.object().keys({
        name: Joi.string().valid(apmName).required(),
        placement: Joi.string().required(),
        returnUrl: Joi.string()
          .warning('deprecate.error', { reason: returnUrlsDeprecationMessage })
          .messages({ 'deprecate.error': `{#label} is no longer supported in ${apmName} APM config. {#reason}` }),
      }).unknown();
    case APMName.ZIP:
      return Joi.object().keys({
        name: Joi.string().valid(apmName).required(),
        placement: Joi.string().required(),
        returnUrl: Joi.string()
          .warning('deprecate.error', { reason: returnUrlsDeprecationMessage })
          .messages({ 'deprecate.error': `{#label} is no longer supported in ${apmName} APM config. {#reason}` }),
        minBaseAmount: Joi.number().greater(0).integer(),
        maxBaseAmount: Joi.number().greater(0).integer(),
      }).unknown();
    default:
      return Joi.object().keys({
        name: Joi.string().valid(apmName).required(),
        placement: Joi.string().required(),
        successRedirectUrl: Joi.string()
          .warning('deprecate.error', { reason: returnUrlsDeprecationMessage })
          .messages({ 'deprecate.error': `{#label} is no longer supported in ${apmName} APM config. {#reason}` }),
        errorRedirectUrl: Joi.string()
          .warning('deprecate.error', { reason: returnUrlsDeprecationMessage })
          .messages({ 'deprecate.error': `{#label} is no longer supported in ${apmName} APM config. {#reason}` }),
        cancelRedirectUrl: Joi.string()
          .warning('deprecate.error', { reason: returnUrlsDeprecationMessage })
          .messages({ 'deprecate.error': `{#label} is no longer supported in ${apmName} APM config. {#reason}` }),
      }).unknown()
  }
};

export const APMSchemasMap: Map<APMName, ObjectSchema> = new Map()
  .set(APMName.ACCOUNT2ACCOUNT, configSchemaFactory(APMName.ACCOUNT2ACCOUNT))
  .set(APMName.ALIPAY, configSchemaFactory(APMName.ALIPAY))
  .set(APMName.BANCONTACT, configSchemaFactory(APMName.BANCONTACT))
  .set(APMName.BITPAY, configSchemaFactory(APMName.BITPAY))
  .set(APMName.EPS, configSchemaFactory(APMName.EPS))
  .set(APMName.GIROPAY, configSchemaFactory(APMName.GIROPAY))
  .set(APMName.IDEAL, configSchemaFactory(APMName.IDEAL))
  .set(APMName.MULTIBANCO, configSchemaFactory(APMName.MULTIBANCO))
  .set(APMName.MYBANK, configSchemaFactory(APMName.MYBANK))
  .set(APMName.PAYU, configSchemaFactory(APMName.PAYU))
  .set(APMName.POSTFINANCE, configSchemaFactory(APMName.POSTFINANCE))
  .set(APMName.PRZELEWY24, configSchemaFactory(APMName.PRZELEWY24))
  .set(APMName.REDPAGOS, configSchemaFactory(APMName.REDPAGOS))
  .set(APMName.SAFETYPAY, configSchemaFactory(APMName.SAFETYPAY))
  .set(APMName.SEPADD, configSchemaFactory(APMName.SEPADD))
  .set(APMName.SOFORT, configSchemaFactory(APMName.SOFORT))
  .set(APMName.TRUSTLY, configSchemaFactory(APMName.TRUSTLY))
  .set(APMName.UNIONPAY, configSchemaFactory(APMName.UNIONPAY))
  .set(APMName.WECHATPAY, configSchemaFactory(APMName.WECHATPAY))
  .set(APMName.ZIP, configSchemaFactory(APMName.ZIP));
