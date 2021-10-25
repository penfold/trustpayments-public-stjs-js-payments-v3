import Joi, { ObjectSchema } from 'joi';
import { APMName } from './APMName';

export const APMSchema: ObjectSchema = Joi.object().keys({
  placement: Joi.string().required(),
  successRedirectUrl: Joi.string().required(),
  errorRedirectUrl: Joi.string().required(),
  cancelRedirectUrl: Joi.string(),
  apmList: Joi.array()
    .items(Joi.string().valid(...Object.values(APMName)), Joi.object())
    .required(),
});

const configSchemaFactory = (apmName: APMName) => Joi.object().keys({
  name: Joi.string().valid(apmName).required(),
  placement: Joi.string().required(),
  successRedirectUrl: Joi.string().required(),
  errorRedirectUrl: Joi.string().required(),
  cancelRedirectUrl: Joi.string(),
});

export const APMSchemasMap: Map<APMName, ObjectSchema> = new Map()
  .set(APMName.BANCONTACT, configSchemaFactory(APMName.BANCONTACT))
  .set(APMName.BITPAY, configSchemaFactory(APMName.BITPAY))
  .set(APMName.GIROPAY, configSchemaFactory(APMName.GIROPAY))
  .set(APMName.EPS, configSchemaFactory(APMName.EPS))
  .set(APMName.IDEAL, configSchemaFactory(APMName.IDEAL))
  .set(APMName.MYBANK, configSchemaFactory(APMName.MYBANK))
  .set(APMName.PAYU, configSchemaFactory(APMName.PAYU))
  .set(APMName.POSTFINANCE, configSchemaFactory(APMName.POSTFINANCE))
  .set(APMName.PRZELEWY24, configSchemaFactory(APMName.PRZELEWY24))
  .set(APMName.REDPAGOS, configSchemaFactory(APMName.REDPAGOS))
  .set(APMName.UNIONPAY, configSchemaFactory(APMName.UNIONPAY))
  .set(APMName.ZIP, configSchemaFactory(APMName.ZIP));
