import Joi from 'joi';

export const ComponentsConfigSchema = Joi.object().keys({
  defaultPaymentType: Joi.string(),
  paymentTypes: Joi.array().items(Joi.string()),
  startOnLoad: Joi.boolean()
});
