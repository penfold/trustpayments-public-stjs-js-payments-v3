import Joi, { ObjectSchema } from 'joi';
import { APMName } from './APMName';

const alipayJwtSchema = Joi.object().keys({
  currencyiso3a: Joi.string().pattern(/^[A-Z]{3}$/).required(),
  orderreference: Joi.string().max(25).required(),
}).unknown();

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
  billingdob: Joi.string().required(),
}).unknown();

const sepaddJwtSchema = Joi.object().keys({
  billingcountryiso2a: Joi.string().pattern(/^[A-Z]{2}$/).required(),
  currencyiso3a: Joi.string().pattern(/^[A-Z]{3}$/).required(),
  billingemail: Joi.string().required(),
}).unknown();

const wechatpayJwtSchema = Joi.object().keys({
  billingcountryiso2a: Joi.string().pattern(/^[A-Z]{2}$/).required(),
  currencyiso3a: Joi.string().pattern(/^[A-Z]{3}$/).required(),
}).unknown();

const zipJwtSchema = Joi.object().keys({
  accounttypedescription: Joi.string().max(25).required(),
  currencyiso3a: Joi.string().pattern(/^[A-Z]{3}$/).required(),
  baseamount: Joi.string().required(),
  mainamount: Joi.string().required(),
  requesttypedescriptions: Joi.array().required(),
  sitereference: Joi.string().max(50).required(),
  billingfirstname: Joi.string().max(127).required(),
  billinglastname: Joi.string().max(127).required(),
  billingpremise: Joi.string().max(25).required(),
  billingstreet: Joi.string().max(127).required(),
  billingtown: Joi.string().max(127).required(),
  billingpostcode: Joi.string().max(127).required(),
  billingcounty: Joi.string().max(127).required(),
  billingemail: Joi.string().max(255).required(),
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
  .set(APMName.REDPAGOS, redpagosJwtSchema)
  .set(APMName.SEPADD, sepaddJwtSchema)
  .set(APMName.SAFETYPAY, pproJwtSchema)
  .set(APMName.SOFORT, pproJwtSchema)
  .set(APMName.TRUSTLY, pproJwtSchema)
  .set(APMName.UNIONPAY, pproJwtSchema)
  .set(APMName.WECHATPAY, wechatpayJwtSchema)
  .set(APMName.ZIP, zipJwtSchema);