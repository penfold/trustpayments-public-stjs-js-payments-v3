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
    label: Joi.string(),
    type: Joi.string().valid('final', 'pending'),
  },
  lineItems: Joi.array().items(
    Joi.object().keys({
      amount: Joi.string(),
      label: Joi.string(),
      type: Joi.string().valid('final', 'pending'),
    })
  ),
  applicationData: Joi.string(),
  billingContact: Joi.object().keys({
    phoneNumber: Joi.string(),
    emailAddress: Joi.string(),
    givenName: Joi.string(),
    familyName: Joi.string(),
    phoneticGivenName: Joi.string(),
    phoneticFamilyName: Joi.string(),
    addressLines: Joi.string(),
    subLocality: Joi.string(),
    locality: Joi.string(),
    postalCode: Joi.string(),
    subAdministrativeArea: Joi.string(),
    administrativeArea: Joi.string(),
    country: Joi.string(),
    countryCode: Joi.string(),
  }),
  shippingType: Joi.string(),
  shippingMethods: Joi.object().keys({
    label: Joi.string(),
    amount: Joi.string(),
    detail: Joi.string(),
    identifier: Joi.string(),
  }),
  shippingContact: Joi.object().keys({
    phoneNumber: Joi.string(),
    emailAddress: Joi.string(),
    givenName: Joi.string(),
    familyName: Joi.string(),
    phoneticGivenName: Joi.string(),
    phoneticFamilyName: Joi.string(),
    addressLines: Joi.string(),
    subLocality: Joi.string(),
    locality: Joi.string(),
    postalCode: Joi.string(),
    subAdministrativeArea: Joi.string(),
    administrativeArea: Joi.string(),
    country: Joi.string(),
    countryCode: Joi.string(),
  }),
  supportedCountries: Joi.array().items(Joi.string()),
  requiredBillingContactFields: Joi.array().items(Joi.string()),
  requiredShippingContactFields: Joi.array().items(Joi.string()),
});
