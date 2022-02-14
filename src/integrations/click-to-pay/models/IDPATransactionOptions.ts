// TODO add enums for some fields
export interface IDPATransactionOptions {
  dpaAcceptedBillingCountries?: string[],
  dpaAcceptedShippingCountries?: string[],
  dpaBillingPreference?: string,
  dpaShippingPreference?: string,
  consumerNameRequested?: boolean,
  consumerEmailAddressRequested?: boolean,
  consumerPhoneNumberRequested?: boolean,
  paymentOptions?: {
    dynamicDataType: string,
    dpaPanRequested: boolean
  },
  reviewAction?: string,
  checkoutDescription?:  string,
  transactionType?:  string,
  orderType?:  string,
  payloadTypeIndicator?:  string,
  merchantOrderId?:  string,
  merchantCategoryCode?:  string,
  merchantCountryCode?:  string,
}
