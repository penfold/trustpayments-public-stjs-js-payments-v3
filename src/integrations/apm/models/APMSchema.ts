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
  .set(APMName.UNIONPAY, configSchemaFactory(APMName.UNIONPAY))
  .set(APMName.ZIP, configSchemaFactory(APMName.ZIP));
