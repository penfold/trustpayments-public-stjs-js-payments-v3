import { array, object, ObjectSchema, string } from 'joi';
import { APMNameList } from './IAPMConfig';

export const APMSchema: ObjectSchema = object().keys({
  placement: string().required(),
  successRedirectUrl: string().required(),
  errorRedirectUrl: string().required(),
  cancelRedirectUrl: string().required(),
  apmList: array().items(
    string().valid(...APMNameList),
    object().keys({
      name: string().valid(...APMNameList),
      successRedirectUrl: string(),
      errorRedirectUrl: string(),
      cancelRedirectUrl: string(),
    }),
  ).required(),
});
