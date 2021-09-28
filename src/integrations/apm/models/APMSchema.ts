import { ObjectSchema, object, string, array } from 'joi';

export const APMSchema: ObjectSchema = object().keys({
  placement: string().required(),
  successRedirectUrl: string().required(),
  errorRedirectUrl: string().required(),
  cancelRedirectUrl: string().required(),
  apmList: array().items(
    string().valid('zip', 'sofort'),
    object().keys({
      name: string().valid('zip', 'sofort'),
      successRedirectUrl: string(),
      errorRedirectUrl: string(),
      cancelRedirectUrl: string(),
    })
  ).required(),
})
