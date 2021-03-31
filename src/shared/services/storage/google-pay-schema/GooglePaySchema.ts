import Joi from 'joi';

import { GooglePayButtonOptionsSchema } from './GooglePayButtonOptionsSchema';
import { GooglePayPaymentRequestSchema } from './GooglePayPaymentRequestSchema';

export const GooglePaySchema: Joi.ObjectSchema = Joi.object().keys({
  buttonOptions: GooglePayButtonOptionsSchema.required(),
  paymentRequest: GooglePayPaymentRequestSchema.required(),
});
