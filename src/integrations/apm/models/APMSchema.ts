import Joi, {  ObjectSchema } from 'joi';
import { APMName } from './APMName';

export const APMSchema: ObjectSchema = Joi.object().keys({
  placement: Joi.string().required(),
  successRedirectUrl: Joi.string().required(),
  errorRedirectUrl: Joi.string().required(),
  cancelRedirectUrl: Joi.string().required(),
  apmList: Joi.array().items(
    Joi.string().valid(...Object.values(APMName)),
    Joi.object().keys({
      name: Joi.string().valid(...Object.values(APMName)),
      placement: Joi.string(),
      successRedirectUrl: Joi.string(),
      errorRedirectUrl: Joi.string(),
      cancelRedirectUrl: Joi.string(),
    }),
  ).required(),
});
