import Joi from 'joi';

const GooglePayCardSchema: Joi.ObjectSchema = Joi.object().keys({
  allowPrepaidCards: Joi.boolean(),
  alloweCreditCards: Joi.boolean(),
  allowedCardAuthMethods: Joi.array()
    .items(Joi.string())
    .has(Joi.string().valid('PAN_ONLY', 'CRYPTOGRAM_3DS'))
    .required(),
  allowedCardNetworks: Joi.array()
    .items(Joi.string())
    .has(Joi.string().valid('AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'))
    .required(),
  assuranceDetailsRequired: Joi.boolean(),
  billingAddressParameters: Joi.object().keys({
    format: Joi.string().valid('MIN', 'FULL'),
    phoneNumberRequired: Joi.boolean
  }),
  billingAddressRequired: Joi.boolean()
});

const GooglePayPaypalSchema: Joi.ObjectSchema = Joi.object().keys({
  purchase_context: Joi.object()
    .keys({
      purchase_units: Joi.object()
        .keys({
          payee: Joi.object()
            .keys({
              merchant_id: Joi.string().required()
            })
            .required()
        })
        .required()
    })
    .required()
});

export const GooglePayPaymentRequestSchema: Joi.ObjectSchema = Joi.object().keys({
  allowedPaymentMethods: Joi.object()
    .keys({
      parameters: Joi.object().allow(GooglePayCardSchema, GooglePayPaypalSchema).required(),
      tokenizationSpecification: Joi.object()
        .keys({
          parameters: {
            gateway: Joi.string(),
            gatewayMerchantId: Joi.string()
          },
          type: Joi.string()
        })
        .required(),
      type: Joi.string().valid('CARD', 'PAYPAL').required()
    })
    .required(),
  apiVersion: Joi.number().min(2).max(2).integer().required(),
  apiVersionMinor: Joi.number().min(0).max(0).integer().required(),
  callbackIntents: Joi.string().valid('PAYMENT_AUTHORIZATION', 'SHIPPING_ADDRESS', 'SHIPPING_OPTION'),
  emailRequired: Joi.boolean(),
  merchantInfo: Joi.object().keys({ merchantId: Joi.string(), merchantName: Joi.string() }).required(),
  shippingAddressParameters: Joi.object().keys({
    allowedCountryCodes: Joi.array().items(Joi.string()),
    phoneNumberRequired: Joi.boolean()
  }),
  shippingAddressRequired: Joi.boolean(),
  shippingOptionParameters: Joi.object().keys({
    defaultSelectedOptionId: Joi.string(),
    shippingOptions: Joi.object().keys({ description: Joi.string(), id: Joi.string(), label: Joi.string() })
  }),
  shippingOptionRequired: Joi.boolean(),
  transactionInfo: Joi.object()
    .keys({
      checkoutOption: Joi.string().valid('DEFAULT', 'COMPLETE_IMMEDIATE_PURCHASE'),
      countryCode: Joi.string(),
      currencyCode: Joi.string(),
      displayItems: Joi.array().items(
        Joi.object().keys({
          label: Joi.string(),
          price: Joi.string(),
          status: Joi.string().valid('FINAL', 'PENDING'),
          type: Joi.string().valid('LINE_ITEM', 'SUBTOTAL')
        })
      ),
      totalPriceLabel: Joi.string(),
      totalPriceStatus: Joi.string().valid('NOT_CURRENTLY_KNOWN', 'ESTIMATED', 'FINAL'),
      transactionId: Joi.string()
    })
    .required()
});
