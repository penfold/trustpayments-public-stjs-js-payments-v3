import Joi from 'joi';

export const ApplePayPaymentRequestSchema: Joi.ObjectSchema = Joi.object().keys({
  countryCode: Joi.string(),
  currencyCode: Joi.string(),
  merchantCapabilities: Joi.array().items(
    Joi.string().valid('supports3DS', 'supportsCredit', 'supportsDebit', 'supportsEMV')
  ),
  supportedNetworks: Joi.array().items(
    Joi.string().valid(
      'amex',
      'chinaUnionPay',
      'discover',
      'interac',
      'jcb',
      'masterCard',
      'privateLabel',
      'visa',
      'cartesBancaires',
      'eftpos',
      'electron',
      'maestro',
      'vPay',
      'elo',
      'mada'
    )
  ),
  total: {
    amount: Joi.string(),
    label: Joi.string()
  },
  billingContact: Joi.object(),
  shippingContact: Joi.object(),
  requiredBillingContactFields: Joi.array().items(Joi.string()),
  requiredShippingContactFields: Joi.array().items(Joi.string())
});
