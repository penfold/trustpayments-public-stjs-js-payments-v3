import Joi, { ObjectSchema } from 'joi';
import { APMName } from './APMName';

const pproJwtSchema = Joi.object().keys({
  billingcountryiso2a: Joi.string().pattern(/^[A-Z]{2}$/).required(),
  currencyiso3a: Joi.string().pattern(/^[A-Z]{3}$/).required(),
}).unknown();

const przelewy24JwtSchema = Joi.object().keys({
  billingcountryiso2a: Joi.string().pattern(/^[A-Z]{2}$/).required(),
  currencyiso3a: Joi.string().pattern(/^[A-Z]{3}$/).required(),
  billingemail: Joi.string().required(),
}).unknown();

const redpagosJwtSchema = Joi.object().keys({
  billingcountryiso2a: Joi.string().pattern(/^[A-Z]{2}$/).required(),
  currencyiso3a: Joi.string().pattern(/^[A-Z]{3}$/).required(),
  billingemail: Joi.string().required(),
  billingdob:Joi.string().required(),
}).unknown();

const alipayJwtSchema = Joi.object().keys({
  currencyiso3a: Joi.string().pattern(/^[A-Z]{3}$/).required(),
  orderreference: Joi.string().max(25).required(),
}).unknown();

const wechatpayJwtSchema = Joi.object().keys({
  billingcountryiso2a: Joi.string().pattern(/^[A-Z]{2}$/).required(),
  currencyiso3a: Joi.string().pattern(/^[A-Z]{3}$/).required(),
}).unknown();

const sepaddJwtSchema = Joi.object().keys({
  billingcountryiso2a: Joi.string().pattern(/^[A-Z]{2}$/).required(),
  currencyiso3a: Joi.string().pattern(/^[A-Z]{3}$/).required(),
  billingemail: Joi.string().required(),
}).unknown();

export const AMPJwtSchemasMap: Map<APMName, ObjectSchema> = new Map()
  .set(APMName.ALIPAY, alipayJwtSchema)
  .set(APMName.BANCONTACT, pproJwtSchema)
  .set(APMName.BITPAY, pproJwtSchema)
  .set(APMName.EPS, pproJwtSchema)
  .set(APMName.GIROPAY, pproJwtSchema)
  .set(APMName.IDEAL, pproJwtSchema)
  .set(APMName.MULTIBANCO, pproJwtSchema)
  .set(APMName.MYBANK, pproJwtSchema)
  .set(APMName.PAYU, pproJwtSchema)
  .set(APMName.POSTFINANCE, pproJwtSchema)
  .set(APMName.PRZELEWY24, przelewy24JwtSchema)
  .set(APMName.QIWI, pproJwtSchema)
  .set(APMName.REDPAGOS, pproJwtSchema)
  .set(APMName.SEPADD, sepaddJwtSchema)
  .set(APMName.SAFETYPAY, pproJwtSchema)
  .set(APMName.SOFORT, pproJwtSchema)
  .set(APMName.TRUSTLY, pproJwtSchema)
  .set(APMName.UNIONPAY, pproJwtSchema)
  .set(APMName.WECHATPAY, wechatpayJwtSchema)
  .set(APMName.ZIP, pproJwtSchema);
