import Joi from 'joi';
import { ApplePayPaymentRequestSchema } from './ApplePayPaymentRequestSchema';

export const ApplePaySchema: Joi.ObjectSchema = Joi.object().keys({
  buttonStyle: Joi.string().valid('black', 'white', 'white-outline'),
  buttonText: Joi.string().valid('plain', 'buy', 'book', 'donate', 'check-out', 'subscribe'),
  merchantId: Joi.string(),
  merchantUrl: Joi.string(),
  paymentRequest: ApplePayPaymentRequestSchema,
  placement: Joi.string(),
});
