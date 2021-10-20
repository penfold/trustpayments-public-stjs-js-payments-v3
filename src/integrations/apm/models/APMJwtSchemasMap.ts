import Joi, { ObjectSchema } from 'joi';
import { APMName } from './APMName';

const pproJwtSchema = Joi.object().keys({
  billingcountryiso2a: Joi.string().pattern(/^[A-Z]{2}$/).required(),
  currencyiso3a: Joi.string().pattern(/^[A-Z]{3}$/).required(),
}).unknown();

export const AMPJwtSchemasMap: Map<APMName, ObjectSchema> = new Map()
  .set(APMName.ZIP, pproJwtSchema);
