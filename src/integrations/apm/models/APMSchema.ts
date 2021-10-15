import Joi, { ObjectSchema } from 'joi';
import { APMName } from './APMName';

export const APMSchema: ObjectSchema = Joi.object().keys({
  placement: Joi.string().required(),
  successRedirectUrl: Joi.string().required(),
  errorRedirectUrl: Joi.string().required(),
  cancelRedirectUrl: Joi.string().required(),
  apmList: Joi.array()
    .items(Joi.string().valid(...Object.values(APMName)), Joi.object())
    .required(),
});

const qiwiConfigSchema = Joi.object().keys({
  name: Joi.string().valid(APMName.QIWI),
  placement: Joi.string().required(),
  successRedirectUrl: Joi.string().required(),
  errorRedirectUrl: Joi.string().required(),
  cancelRedirectUrl: Joi.string().required(),
});

const zipConfigSchema = Joi.object().keys({
  name: Joi.string().valid(APMName.ZIP),
  placement: Joi.string().required(),
  successRedirectUrl: Joi.string().required(),
  errorRedirectUrl: Joi.string().required(),
  cancelRedirectUrl: Joi.string().required(),
});

export const APMSchemasMap: Map<APMName, ObjectSchema> = new Map()
  .set(APMName.QIWI, qiwiConfigSchema)
  .set(APMName.ZIP, zipConfigSchema);
