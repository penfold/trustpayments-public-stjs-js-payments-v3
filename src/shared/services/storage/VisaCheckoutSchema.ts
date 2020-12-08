import Joi from 'joi';

export const VisaCheckoutSchema: Joi.ObjectSchema = Joi.object().keys({
  buttonSettings: Joi.object().keys({
    color: Joi.string().allow('neutral', 'standard'),
    size: Joi.number(),
    height: Joi.number(),
    width: Joi.number(),
    locale: Joi.string(),
    cardBrands: Joi.string(),
    acceptCanadianVisaDebit: Joi.string(),
    cobrand: Joi.string()
  }),
  livestatus: Joi.number().valid(0, 1),
  merchantId: Joi.string(),
  paymentRequest: Joi.object().keys({
    merchantRequestId: Joi.string().allow(''),
    currencyCode: Joi.string().allow(''),
    subtotal: Joi.string().allow(''),
    shippingHandling: Joi.string().allow(''),
    tax: Joi.string().allow(''),
    discount: Joi.string().allow(''),
    giftWrap: Joi.string().allow(''),
    misc: Joi.string().allow(''),
    total: Joi.string().allow(''),
    orderId: Joi.string().allow(''),
    description: Joi.string().allow(''),
    promoCode: Joi.string().allow(''),
    customData: Joi.any()
  }),
  placement: Joi.string(),
  settings: Joi.object().keys({
    locale: Joi.string(),
    countryCode: Joi.string(),
    displayName: Joi.string(),
    websiteUrl: Joi.string(),
    customerSupportUrl: Joi.string(),
    enableUserDataPrefill: Joi.boolean(),
    shipping: Joi.object().keys({
      acceptedRegions: Joi.array(),
      collectShipping: Joi.string().allow('true', 'false')
    }),
    payment: Joi.object().keys({
      cardBrands: Joi.array().allow('VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'ELECTRON', 'ELO'),
      acceptCanadianVisaDebit: Joi.string().allow('true', 'false'),
      billingCountries: Joi.array()
    }),
    review: Joi.object().keys({
      message: Joi.string(),
      buttonAction: Joi.string()
    }),
    threeDSSetup: Joi.object().keys({
      threeDSActive: Joi.string().allow('true', 'false'),
      threeDSSuppressChallenge: Joi.string().allow('true', 'false')
    }),
    dataLevel: Joi.string()
  })
});
