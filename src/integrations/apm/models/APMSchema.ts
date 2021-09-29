import { array, object, ObjectSchema, string } from 'joi';
import { APMName } from './APMName';

export const APMSchema: ObjectSchema = object().keys({
  placement: string().required(),
  successRedirectUrl: string().required(),
  errorRedirectUrl: string().required(),
  cancelRedirectUrl: string().required(),
  apmList: array().items(
    string().valid(...Object.values(APMName)),
    object().keys({
      name: string().valid(...Object.values(APMName)),
      placement: string(),
      successRedirectUrl: string(),
      errorRedirectUrl: string(),
      cancelRedirectUrl: string(),
    }),
  ).required(),
});
