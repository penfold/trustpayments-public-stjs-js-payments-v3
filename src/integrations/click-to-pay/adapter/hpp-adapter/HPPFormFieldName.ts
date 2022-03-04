// TODO remove fields that are not used by click to pay adapter
export enum HPPFormFieldName {
  pan = 'pan',
  cardExpiryMonth = 'expirymonth',
  cardExpiryYear = 'expiryyear',
  cardSecurityCode = 'securitycode',
  register = 'register',
  billingPrefixName = 'billingprefixname',
  billingFirstName = 'billingfirstname',
  billingLastName = 'billinglastname',
  billingPremise = 'billingpremise',
  billingStreet = 'billingstreet',
  billingTown = 'billingtown',
  billingCounty = 'billingcounty',
  billingCountryIso2a = 'billingcountryiso2a',
  billingPostCode = 'billingpostcode',
  billingEmail = 'billingemail',
  billingTelephone = 'billingtelephone',
  billingTelephoneType = 'billingtelephonetype',
  srcCardId = 'srcDigitalCardId'
}
